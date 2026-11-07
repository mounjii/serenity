import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { z } from "zod";
import { customerPhoneSchema } from "@/lib/booking-schema";
import { isLoginThrottled, recordLoginFailure } from "@/server/auth/credentials";
import { MIN_CUSTOMER_PASSWORD } from "@/server/customer/auth";
import { getDb } from "@/server/db";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const emailSchema = z.string().trim().max(120).pipe(z.email());

export type ResetChannel = "email" | "phone";

export type ResetSendResult =
  | { status: "sent"; devCode?: string }
  | { status: "invalid" }
  | { status: "throttled" }
  | { status: "unavailable" };

export type ResetConfirmResult =
  | { status: "ok" }
  | { status: "invalid-code" }
  | { status: "invalid-password"; field: "password" | "confirmPassword" }
  | { status: "throttled" };

function hashCode(customerId: string, code: string): string {
  const secret = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(`${secret}:${customerId}:${code}`).digest("hex");
}

function codesMatch(stored: string, candidate: string): boolean {
  const left = Buffer.from(stored);
  const right = Buffer.from(candidate);
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseDestination(channel: ResetChannel, raw: string): string | null {
  if (channel === "email") {
    const parsed = emailSchema.safeParse(raw);
    return parsed.success ? parsed.data.toLowerCase() : null;
  }
  const parsed = customerPhoneSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

async function deliver(channel: ResetChannel, to: string, text: string): Promise<"sent" | "dev" | "unavailable"> {
  try {
    if (channel === "email" && process.env.SMTP_HOST?.trim() && process.env.SMTP_FROM?.trim()) {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === "465",
        auth: process.env.SMTP_USER?.trim()
          ? { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS ?? "" }
          : undefined,
      });
      await transport.sendMail({ from: process.env.SMTP_FROM.trim(), to, subject: "Touch Sense", text });
      return "sent";
    }
    const token = process.env.META_WA_TOKEN?.trim();
    const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.trim();
    if (channel === "phone" && token && phoneNumberId) {
      const version = process.env.META_WA_API_VERSION?.trim() || "v21.0";
      const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          type: "text",
          text: { body: text },
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return "unavailable";
      return "sent";
    }
  } catch (error) {
    console.error("[password-reset] delivery failed", error instanceof Error ? error.message : "unknown");
    return "unavailable";
  }
  if (process.env.NODE_ENV !== "production") return "dev";
  return "unavailable";
}

export async function requestPasswordReset(input: {
  channel: ResetChannel;
  destination: string;
  message: string;
  throttleKey: string;
}): Promise<ResetSendResult> {
  if (isLoginThrottled(input.throttleKey)) return { status: "throttled" };
  const destination = parseDestination(input.channel, input.destination);
  if (!destination) return { status: "invalid" };
  recordLoginFailure(input.throttleKey);

  const db = getDb();
  const customer =
    input.channel === "email"
      ? await db.customer.findUnique({ where: { email: destination }, select: { id: true } })
      : await db.customer.findUnique({ where: { phone: destination }, select: { id: true } });

  if (!customer) return { status: "sent" };

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const text = input.message.replaceAll("{code}", code);
  const sent = await deliver(input.channel, destination, text);
  if (sent === "unavailable") return { status: "unavailable" };

  await db.passwordReset.deleteMany({ where: { customerId: customer.id } });
  await db.passwordReset.create({
    data: {
      customerId: customer.id,
      channel: input.channel,
      codeHash: hashCode(customer.id, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  if (sent === "dev") {
    console.info(`[password-reset] development code for ${input.channel}: ${code}`);
    return { status: "sent", devCode: code };
  }
  return { status: "sent" };
}

export async function confirmPasswordReset(input: {
  channel: ResetChannel;
  destination: string;
  code: string;
  password: string;
  confirmPassword: string;
  throttleKey: string;
}): Promise<ResetConfirmResult> {
  if (isLoginThrottled(input.throttleKey)) return { status: "throttled" };
  const destination = parseDestination(input.channel, input.destination);
  const code = input.code.replace(/\s/g, "");
  if (!destination || !/^\d{6}$/.test(code)) {
    recordLoginFailure(input.throttleKey);
    return { status: "invalid-code" };
  }

  const password = input.password.trim();
  if (password.length < MIN_CUSTOMER_PASSWORD) return { status: "invalid-password", field: "password" };
  if (password !== input.confirmPassword.trim()) return { status: "invalid-password", field: "confirmPassword" };

  const db = getDb();
  const customer =
    input.channel === "email"
      ? await db.customer.findUnique({ where: { email: destination }, select: { id: true } })
      : await db.customer.findUnique({ where: { phone: destination }, select: { id: true } });
  const reset = customer
    ? await db.passwordReset.findFirst({
        where: { customerId: customer.id, channel: input.channel, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (!customer || !reset || reset.attempts >= MAX_ATTEMPTS || !codesMatch(reset.codeHash, hashCode(customer.id, code))) {
    if (reset && reset.attempts + 1 >= MAX_ATTEMPTS) await db.passwordReset.delete({ where: { id: reset.id } });
    else if (reset) await db.passwordReset.update({ where: { id: reset.id }, data: { attempts: { increment: 1 } } });
    recordLoginFailure(input.throttleKey);
    return { status: "invalid-code" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.customer.update({ where: { id: customer.id }, data: { passwordHash } });
  await db.passwordReset.deleteMany({ where: { customerId: customer.id } });
  return { status: "ok" };
}
