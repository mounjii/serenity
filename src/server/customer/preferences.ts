import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { serviceText } from "@/i18n/services";
import { DISCOVERY_SOURCES, VISIT_FREQUENCIES, WELLNESS_GOALS } from "@/lib/customer-preferences";
import { getDb } from "@/server/db";
import { invalidInput, zodFieldErrors } from "@/server/errors";

export async function getCustomerProfile(customerId: string) {
  return getDb().customer.findUnique({
    where: { id: customerId },
    select: {
      email: true,
      birthday: true,
      preferredMassage: true,
      wellnessGoal: true,
      visitFrequency: true,
      discovery: true,
      avatarType: true,
      updatedAt: true,
    },
  });
}

export async function preferredMassageName(slug: string | null, locale: Locale): Promise<string | null> {
  if (!slug) return null;
  const row = await getDb().service.findUnique({
    where: { slug },
    select: { slug: true, name: true, description: true },
  });
  return row ? serviceText(getDictionary(locale), row).name : null;
}

const preferencesSchema = z.object({
  preferredMassage: z.string().trim().min(1).max(80),
  wellnessGoal: z.enum(WELLNESS_GOALS),
  visitFrequency: z.enum(VISIT_FREQUENCIES),
  discovery: z.enum(DISCOVERY_SOURCES),
});

export async function saveCustomerPreferences(
  customerId: string,
  input: { preferredMassage: string; wellnessGoal: string; visitFrequency: string; discovery: string },
): Promise<void> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) throw invalidInput("Please check the highlighted fields.", zodFieldErrors(parsed.error));

  const service = await getDb().service.findFirst({
    where: { slug: parsed.data.preferredMassage, active: true },
    select: { slug: true },
  });
  if (!service) throw invalidInput("Please check the highlighted fields.", { preferredMassage: "invalid" });

  await getDb().customer.update({
    where: { id: customerId },
    data: {
      preferredMassage: service.slug,
      wellnessGoal: parsed.data.wellnessGoal,
      visitFrequency: parsed.data.visitFrequency,
      discovery: parsed.data.discovery,
    },
  });
}
