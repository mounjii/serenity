import type { ServiceOptionValue } from "@/lib/service-options";
import { getDb } from "@/server/db";

export type PublicServiceOption = ServiceOptionValue;

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Active durations, shortest first. Never empty. */
  options: PublicServiceOption[];
};

export async function getActiveServices(): Promise<PublicService[]> {
  const rows = await getDb().service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      options: {
        where: { active: true },
        orderBy: { durationMinutes: "asc" },
        select: { durationMinutes: true, priceCents: true },
      },
    },
  });
  return rows.filter((s) => s.options.length > 0);
}
