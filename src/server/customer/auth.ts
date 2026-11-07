import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { customerNameSchema, customerPhoneSchema } from "@/lib/booking-schema";
import { clearLoginFailures, isLoginThrottled, recordLoginFailure } from "@/server/auth/credentials";
import { importPastVisits } from "@/server/loyalty/engine";
import { getDb } from "@/server/db";
import { invalidInput, zodFieldErrors } from "@/server/errors";

export const MIN_CUSTOMER_PASSWORD = 8;

const passwordSchema = z
  .string({ error: "Please enter a password." })
  .max(200)
  .transform((value) => value.trim())
  .pipe(z.string().min(MIN_CUSTOMER_PASSWORD, `Password must be at least ${MIN_CUSTOMER_PASSWORD} characters.`));

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((value) => value === "" || z.email().safeParse(value).success, "Please enter a valid email.");

const dateOfBirth = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date of birth.")
  .refine((value) => {
    const year = Number(value.slice(0, 4));
    const date = new Date(`${value}T00:00:00.000Z`);
    return year >= 1900 && !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
  }, "Please enter a valid date of birth.");

const registerSchema = z
  .object({
    name: customerNameSchema,
    phone: customerPhoneSchema,
    email: optionalEmail,
    birthday: dateOfBirth,
    password: passwordSchema,
    confirmPassword: z.string().max(200),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword.trim()) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "The passwords do not match." });
    }
  });

const loginSchema = z.object({
  phone: customerPhoneSchema,
  password: z.string().min(1, "Please enter a password.").max(200),
});

export type RegisteredCustomer = { id: string; name: string; phone: string; passwordHash: string };

export async function registerCustomer(input: {
  name: string;
  phone: string;
  email: string;
  birthday: string;
  password: string;
  confirmPassword: string;
}): Promise<RegisteredCustomer> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));

  const email = parsed.data.email === "" ? null : parsed.data.email.toLowerCase();
  const existing = await getDb().customer.findUnique({ where: { phone: parsed.data.phone } });
  if (existing) throw invalidInput("An account already exists for this number.", { phone: "taken" });
  if (email) {
    const emailTaken = await getDb().customer.findUnique({ where: { email } });
    if (emailTaken) throw invalidInput("An account already uses this email.", { email: "taken" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const row = await getDb().customer.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email,
        birthday: new Date(`${parsed.data.birthday}T00:00:00.000Z`),
        passwordHash,
      },
    });
    await importPastVisits(row.id, row.phone);
    return { id: row.id, name: row.name, phone: row.phone, passwordHash: row.passwordHash };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      if (target.includes("email")) throw invalidInput("An account already uses this email.", { email: "taken" });
      throw invalidInput("An account already exists for this number.", { phone: "taken" });
    }
    throw error;
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter a password.").max(200),
    password: passwordSchema,
    confirmPassword: z.string().max(200),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword.trim()) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "The passwords do not match." });
    }
  });

export async function changeCustomerPassword(
  customerId: string,
  input: { currentPassword: string; password: string; confirmPassword: string },
): Promise<string> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));

  const row = await getDb().customer.findUnique({ where: { id: customerId } });
  if (!row) throw invalidInput("Please check the highlighted fields.");
  const currentOk = await bcrypt.compare(parsed.data.currentPassword, row.passwordHash);
  if (!currentOk) throw invalidInput("Current password is incorrect.", { currentPassword: "invalid" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await getDb().customer.update({ where: { id: customerId }, data: { passwordHash } });
  return passwordHash;
}

export async function loginCustomer(
  input: { phone: string; password: string },
  throttleKey: string,
): Promise<RegisteredCustomer | "throttled" | "invalid"> {
  if (isLoginThrottled(throttleKey)) return "throttled";

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    recordLoginFailure(throttleKey);
    return "invalid";
  }

  const row = await getDb().customer.findUnique({ where: { phone: parsed.data.phone } });
  const dummyHash = "$2a$12$R9h/cIPz0gi.URNNXXkh.OG8i2fYcYxK8n5u0cG0k1m2n3o4p5q6r";
  const passwordOk = await bcrypt.compare(parsed.data.password, row?.passwordHash ?? dummyHash);
  if (!row || !passwordOk) {
    recordLoginFailure(throttleKey);
    return "invalid";
  }

  clearLoginFailures(throttleKey);
  return { id: row.id, name: row.name, phone: row.phone, passwordHash: row.passwordHash };
}
