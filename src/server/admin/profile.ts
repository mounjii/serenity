import bcrypt from "bcryptjs";
import { z } from "zod";
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

export type AdminProfile = { username: string };

export async function getAdminProfile(): Promise<AdminProfile> {
  const { username } = await getAdminConfig();
  return { username };
}

export async function updateAdminProfile(input: {
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AdminProfile> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));

  const config = await getAdminConfig();
  const currentOk = await bcrypt.compare(parsed.data.currentPassword, config.passwordHash);
  if (!currentOk) throw invalidInput("Current password is incorrect.", { currentPassword: "Current password is incorrect." });

  const passwordHash = parsed.data.newPassword
    ? await bcrypt.hash(parsed.data.newPassword, 12)
    : config.passwordHash;

  await getDb().adminAccount.upsert({
    where: { id: 1 },
    create: { id: 1, username: parsed.data.username, passwordHash },
    update: { username: parsed.data.username, passwordHash },
  });
  clearAdminConfigCache();
  return { username: parsed.data.username };
}
