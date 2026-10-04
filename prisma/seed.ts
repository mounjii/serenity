import { existsSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env")) {
  process.loadEnvFile(".env");
}

const services = [
  {
    slug: "swedish-massage",
    name: "Swedish Massage",
    description: "Gentle, flowing strokes to relieve tension and promote relaxation.",
    durationMinutes: 60,
    priceCents: 7000,
    sortOrder: 1,
  },
  {
    slug: "deep-tissue-massage",
    name: "Deep Tissue Massage",
    description: "Targeted pressure to release muscle tension and improve mobility.",
    durationMinutes: 60,
    priceCents: 8000,
    sortOrder: 2,
  },
  {
    slug: "aromatherapy-massage",
    name: "Aromatherapy Massage",
    description: "Essential oils to calm your mind and balance your energy.",
    durationMinutes: 60,
    priceCents: 7500,
    sortOrder: 3,
  },
  {
    slug: "relaxation-massage",
    name: "Relaxation Massage",
    description: "A full-body experience for deep relaxation and mental clarity.",
    durationMinutes: 60,
    priceCents: 6500,
    sortOrder: 4,
  },
];

// 0 = Sunday (closed), 1-6 = Monday-Saturday 10:00-20:00.
const openingHours = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  openMinute: 600,
  closeMinute: 1200,
  closed: weekday === 0,
}));

async function main() {
  const { getDb } = await import("../src/server/db");
  const db = getDb();

  for (const service of services) {
    await db.service.upsert({
      where: { slug: service.slug },
      create: { ...service, active: true },
      update: service,
    });
  }

  await db.therapist.upsert({
    where: { id: "therapist-main" },
    create: { id: "therapist-main", name: "Main therapist", active: true },
    update: {},
  });

  for (const hours of openingHours) {
    await db.openingHours.upsert({ where: { weekday: hours.weekday }, create: hours, update: hours });
  }

  console.log(`Seeded ${services.length} services, 1 therapist, ${openingHours.length} opening-hours rows.`);
  await db.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
