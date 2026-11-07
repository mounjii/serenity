import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { parseAdminAreas, serializeAdminAreas, type AdminArea } from "@/lib/admin-areas";
import { clearAdminConfigCache, getAdminConfig } from "@/server/auth/config";
import { getDb } from "@/server/db";
import { invalidInput, zodFieldErrors } from "@/server/errors";

export const MIN_ADMIN_PASSWORD = 10;

const usernameSchema = z
  .string({ error: "Please enter a name." })
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(40, "Name must be at most 40 characters.")
      .regex(/^[\p{L}\p{N} .'_-]+$/u, "Use letters, numbers, spaces, dots, hyphens or apostrophes."),
  );

const profileSchema = z
  .object({
    username: usernameSchema,
    currentPassword: z.string().min(1, "Enter your current password.").max(200),
    newPassword: z.string().max(200).transform((value) => value.trim()),
    confirmPassword: z.string().max(200),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword && value.newPassword.length < MIN_ADMIN_PASSWORD) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: `New password must be at least ${MIN_ADMIN_PASSWORD} characters.`,
      });
    }
    if (value.newPassword && value.newPassword !== value.confirmPassword.trim()) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "The new passwords do not match." });
    }
  });

export type AdminProfile = { username: string; avatarUrl: string | null };

async function accountFor(username: string) {
  const name = username.trim();
  const row = await getDb().adminAccount.findFirst({ where: { username: name } });
  if (row) return row;
  const config = await getAdminConfig();
  if (config.username.toLowerCase() !== name.toLowerCase()) return null;
  return getDb().adminAccount.upsert({
    where: { id: 1 },
    create: { id: 1, username: config.username, passwordHash: config.passwordHash, role: "OWNER" },
    update: { role: "OWNER" },
  });
}

export async function getAdminProfile(username: string): Promise<AdminProfile> {
  const row = await accountFor(username);
  return {
    username: row?.username ?? username,
    avatarUrl: row?.avatarType ? `/api/admin/avatar?v=${row.updatedAt.getTime()}` : null,
  };
}

export async function updateAdminProfile(
  actor: string,
  input: {
    username: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
): Promise<AdminProfile> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));

  const current = await accountFor(actor);
  if (!current) throw invalidInput("Current password is incorrect.", { currentPassword: "Current password is incorrect." });
  const currentOk = await bcrypt.compare(parsed.data.currentPassword, current.passwordHash);
  if (!currentOk) throw invalidInput("Current password is incorrect.", { currentPassword: "Current password is incorrect." });

  const taken = await getDb().adminAccount.findFirst({
    where: { username: parsed.data.username, id: { not: current.id } },
    select: { id: true },
  });
  if (taken) throw invalidInput("That name is already used.", { username: "That name is already used." });

  const passwordHash = parsed.data.newPassword ? await bcrypt.hash(parsed.data.newPassword, 12) : current.passwordHash;
  const row = await getDb().adminAccount.update({
    where: { id: current.id },
    data: { username: parsed.data.username, passwordHash },
  });
  if (current.role === "OWNER") clearAdminConfigCache();
  return { username: row.username, avatarUrl: row.avatarType ? `/api/admin/avatar?v=${row.updatedAt.getTime()}` : null };
}

export type StaffAdmin = { id: number; username: string; areas: AdminArea[] };

function areasFrom(values: string[]): AdminArea[] {
  const areas = parseAdminAreas(values.join(","));
  if (areas.length === 0) throw invalidInput("Choose at least one area.", { areas: "Choose at least one area." });
  return areas;
}

export async function listStaffAdmins(): Promise<StaffAdmin[]> {
  const rows = await getDb().adminAccount.findMany({
    where: { role: "STAFF" },
    orderBy: { username: "asc" },
    select: { id: true, username: true, permissions: true },
  });
  return rows.map((row) => ({ id: row.id, username: row.username, areas: parseAdminAreas(row.permissions) }));
}

export async function createStaffAdmin(
  actor: string,
  input: { username: string; password: string; confirmPassword: string; areas: string[] },
): Promise<void> {
  const parsed = z
    .object({
      username: usernameSchema,
      password: z
        .string()
        .max(200)
        .transform((value) => value.trim())
        .pipe(z.string().min(MIN_ADMIN_PASSWORD, `Password must be at least ${MIN_ADMIN_PASSWORD} characters.`)),
      confirmPassword: z.string().max(200),
    })
    .superRefine((value, ctx) => {
      if (value.password !== value.confirmPassword.trim()) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "The passwords do not match." });
      }
    })
    .safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));
  const areas = areasFrom(input.areas);

  const owner = await accountFor(actor);
  if (!owner || owner.role !== "OWNER") throw invalidInput("Only the main admin can add another admin.");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    await getDb().adminAccount.create({
      data: { username: parsed.data.username, passwordHash, role: "STAFF", permissions: serializeAdminAreas(areas) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw invalidInput("That name is already used.", { username: "That name is already used." });
    }
    throw error;
  }
}

export async function removeStaffAdmin(actor: string, id: number): Promise<void> {
  const owner = await accountFor(actor);
  if (!owner || owner.role !== "OWNER") throw invalidInput("Only the main admin can remove an admin.");
  const row = await getDb().adminAccount.findUnique({ where: { id }, select: { role: true } });
  if (!row || row.role === "OWNER") throw invalidInput("The main admin cannot be removed.");
  await getDb().adminAccount.delete({ where: { id } });
}

export async function updateStaffAccess(actor: string, id: number, areasInput: string[]): Promise<void> {
  const owner = await accountFor(actor);
  if (!owner || owner.role !== "OWNER") throw invalidInput("Only the main admin can change access.");
  const areas = areasFrom(areasInput);
  const row = await getDb().adminAccount.findUnique({ where: { id }, select: { role: true } });
  if (!row || row.role === "OWNER") throw invalidInput("The main admin already has every area.");
  await getDb().adminAccount.update({ where: { id }, data: { permissions: serializeAdminAreas(areas) } });
}
