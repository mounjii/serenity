import { existsSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env")) {
  process.loadEnvFile(".env");
}

type SeedService = {
  slug: string;
  name: string;
  description: string;
  /** [duration in minutes, price in MAD] */
  options: [number, number][];
};

const services: SeedService[] = [
  {
    slug: "swedish-massage",
    name: "Swedish Massage",
    description: "Gentle, flowing strokes to relieve tension and promote deep relaxation.",
    options: [[60, 400], [90, 500], [120, 600]],
  },
  {
    slug: "thai-oil-massage",
    name: "Thai Oil Massage",
    description: "Traditional Thai techniques with warm oil to loosen muscles and restore energy.",
    options: [[60, 350], [90, 450], [120, 550]],
  },
  {
    slug: "aroma-massage",
    name: "Aroma Massage",
    description: "Soothing essential oils to calm your mind and balance your body.",
    options: [[60, 350], [90, 450], [120, 550]],
  },
  {
    slug: "head-neck-shoulder-massage",
    name: "Head, Neck & Shoulder",
    description: "Focused work on the upper body to release stress, stiffness and headaches.",
    options: [[60, 300], [90, 450], [120, 550]],
  },
  {
    slug: "thai-massage",
    name: "Thai Massage",
    description: "Assisted stretching and acupressure for flexibility, circulation and balance.",
    options: [[60, 300], [90, 450], [120, 550]],
  },
  {
    slug: "sports-massage",
    name: "Sports Massage",
    description: "Deep, targeted pressure to ease muscle tension and speed up recovery.",
    options: [[60, 450], [90, 550], [120, 700]],
  },
  {
    slug: "foot-reflexology",
    name: "Foot Reflexology",
    description: "Pressure on reflex points of the feet to relax the whole body.",
    options: [[30, 180], [60, 300], [90, 400]],
  },
  {
    slug: "hot-herbal-compress",
    name: "Hot Herbal Compress",
    description: "Warm Thai herbal compresses to soothe sore muscles and deeply relax.",
    options: [[90, 600], [120, 700]],
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

  for (const [index, { options, ...service }] of services.entries()) {
    const data = { ...service, sortOrder: index + 1, active: true };
    const row = await db.service.upsert({ where: { slug: service.slug }, create: data, update: data, select: { id: true } });

    for (const [durationMinutes, priceMad] of options) {
      await db.serviceOption.upsert({
        where: { serviceId_durationMinutes: { serviceId: row.id, durationMinutes } },
        create: { serviceId: row.id, durationMinutes, priceCents: priceMad * 100, active: true },
        update: { priceCents: priceMad * 100, active: true },
      });
    }
    await db.serviceOption.updateMany({
      where: { serviceId: row.id, durationMinutes: { notIn: options.map(([d]) => d) } },
      data: { active: false },
    });
  }

  // Services that are no longer on the menu are hidden, not deleted (past bookings still reference them).
  const hidden = await db.service.updateMany({
    where: { slug: { notIn: services.map((s) => s.slug) } },
    data: { active: false },
  });

  await db.therapist.upsert({
    where: { id: "therapist-main" },
    create: { id: "therapist-main", name: "Main therapist", active: true },
    update: {},
  });

  for (const hours of openingHours) {
    await db.openingHours.upsert({ where: { weekday: hours.weekday }, create: hours, update: hours });
  }

  console.log(
    `Seeded ${services.length} services (${services.reduce((n, s) => n + s.options.length, 0)} durations), ` +
      `hid ${hidden.count} old service(s), 1 therapist, ${openingHours.length} opening-hours rows.`,
  );
  await db.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
