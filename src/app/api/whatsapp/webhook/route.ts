import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { applyCustomerReply } from "@/server/booking/confirmation";
import { getDb } from "@/server/db";
import { jsonResponse } from "@/server/errors";
import { parseReplyPayload } from "@/server/whatsapp/templates";

/** Meta subscription check: echo hub.challenge when the verify token matches META_WA_VERIFY_TOKEN. */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const expected = process.env.META_WA_VERIFY_TOKEN?.trim();
  if (expected && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === expected) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Verification failed." } }, 403);
}

function validSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_WA_APP_SECRET?.trim();
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(header.slice("sha256=".length));
  return expected.length === received.length && timingSafeEqual(expected, received);
}

type InboundMessage = {
  from?: string;
  type?: string;
  button?: { payload?: string };
  interactive?: { button_reply?: { id?: string } };
  text?: { body?: string };
};
type WebhookBody = { entry?: { changes?: { value?: { messages?: InboundMessage[] } }[] }[] };

const YES = /^(yes|y|ok|confirm|oui|naam|نعم|wakha)$/i;
const NO = /^(no|n|cancel|non|la|لا)$/i;

/** A typed yes/no applies to that phone's only waiting booking (if there is exactly one). */
async function singlePendingBookingFor(from: string): Promise<string | null> {
  const phone = from.startsWith("+") ? from : `+${from}`;
  const rows = await getDb().booking.findMany({
    where: { customerPhone: phone, status: "PENDING", startAt: { gt: new Date() } },
    select: { id: true },
    take: 2,
  });
  return rows.length === 1 ? rows[0].id : null;
}

async function handleMessage(message: InboundMessage): Promise<void> {
  const from = message.from;
  if (!from) return;
  const payload = message.button?.payload ?? message.interactive?.button_reply?.id;
  if (payload) {
    const reply = parseReplyPayload(payload);
    if (reply) await applyCustomerReply(reply.bookingId, reply.action, from);
    return;
  }
  const text = message.text?.body?.trim() ?? "";
  const action = YES.test(text) ? "confirm" : NO.test(text) ? "cancel" : null;
  if (!action) return;
  const bookingId = await singlePendingBookingFor(from);
  if (bookingId) await applyCustomerReply(bookingId, action, from);
}

/** Customer replies from the WhatsApp Business Cloud API. Always answers 200 once the signature is valid. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Invalid signature." } }, 401);
  }
  try {
    const body = JSON.parse(rawBody) as WebhookBody;
    const messages = body.entry?.flatMap((e) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];
    for (const message of messages) await handleMessage(message);
  } catch (error) {
    console.error("[whatsapp] webhook processing failed", error);
  }
  return jsonResponse({ ok: true });
}
