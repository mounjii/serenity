import { getDb } from "@/server/db";

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
};

export async function getActiveServices(): Promise<PublicService[]> {
  return getDb().service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      durationMinutes: true,
      priceCents: true,
    },
  });
}
