/**
 * Double-booking tests against a running server (default http://localhost:3005).
 * Usage: npm run test:concurrency   (optionally TEST_BASE_URL=http://localhost:3000)
 */
import { existsSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env")) {
  process.loadEnvFile(".env");
}

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3005";
const TEST_NAME = "Concurrency Test";
const TEST_PHONE = "+212612345678";

type Result = { status: number; body: unknown };

async function main() {
  const { getDb } = await import("../src/server/db");
  const { addDays, localToUtc, toLocalDateString, weekdayOf } = await import("../src/lib/time");
  const db = getDb();

  let failures = 0;
  const check = (label: string, ok: boolean, detail: string) => {
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}\n      ${detail}`);
  };

  const cleanup = async () => {
    await db.booking.deleteMany({ where: { customerName: TEST_NAME } });
  };

  const post = async (body: Record<string, unknown>): Promise<Result> => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  };

  const counts = (results: Result[]) => {
    const map = new Map<number, number>();
    for (const r of results) map.set(r.status, (map.get(r.status) ?? 0) + 1);
    return [...map.entries()].sort(([a], [b]) => a - b).map(([s, n]) => `${n}x ${s}`).join(", ");
  };
  const count = (results: Result[], status: number) => results.filter((r) => r.status === status).length;

  const servicesRes = await fetch(`${BASE_URL}/api/services`);
  if (!servicesRes.ok) throw new Error(`GET /api/services failed with ${servicesRes.status}. Is the server running at ${BASE_URL}?`);
  const { services } = (await servicesRes.json()) as { services: { id: string; name: string }[] };
  const serviceId = services[0].id;

  // A working day (Mon-Sat) between 7 and 20 days ahead with no existing bookings, and the next Sunday.
  const today = toLocalDateString(new Date());
  let testDate = "";
  for (let i = 7; i <= 20 && !testDate; i++) {
    const candidate = addDays(today, i);
    if (weekdayOf(candidate) === 0) continue;
    const taken = await db.booking.count({
      where: { startAt: { gte: localToUtc(candidate, 0), lt: localToUtc(addDays(candidate, 1), 0) }, status: { not: "CANCELLED" } },
    });
    if (taken === 0) testDate = candidate;
  }
  if (!testDate) throw new Error("No free working day found for the test.");
  let sunday = addDays(today, 1);
  while (weekdayOf(sunday) !== 0) sunday = addDays(sunday, 1);

  const at = (date: string, hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return localToUtc(date, h * 60 + m).toISOString();
  };
  const booking = (startAt: string, extra: Record<string, unknown> = {}) => ({
    serviceId,
    startAt,
    customerName: TEST_NAME,
    customerPhone: TEST_PHONE,
    ...extra,
  });

  console.log(`Server: ${BASE_URL}`);
  console.log(`Service: ${services[0].name} (${serviceId})`);
  console.log(`Test day: ${testDate} (Africa/Casablanca), Sunday used for case 7: ${sunday}\n`);

  await cleanup();
  try {
    // 1. Two identical requests in parallel.
    const r1 = await Promise.all([post(booking(at(testDate, "10:00"))), post(booking(at(testDate, "10:00")))]);
    check("1. 2 identical parallel reservations -> one 201, one 409", count(r1, 201) === 1 && count(r1, 409) === 1, counts(r1));
    await cleanup();

    // 2. Ten identical requests in parallel.
    const r2 = await Promise.all(Array.from({ length: 10 }, () => post(booking(at(testDate, "10:00")))));
    check("2. 10 identical parallel reservations -> one 201, nine 409", count(r2, 201) === 1 && count(r2, 409) === 9, counts(r2));
    const inDb2 = await db.booking.count({ where: { customerName: TEST_NAME, status: { not: "CANCELLED" } } });
    check("2b. exactly one booking stored in the database", inDb2 === 1, `${inDb2} booking(s) in database`);
    await cleanup();

    // 3. Overlapping requests with different start times.
    const r3 = await Promise.all([post(booking(at(testDate, "10:00"))), post(booking(at(testDate, "10:30")))]);
    check("3. 10:00 and 10:30 in parallel (overlap) -> one 201, one 409", count(r3, 201) === 1 && count(r3, 409) === 1, counts(r3));
    await cleanup();

    // 4. 10:00 then 11:15: 60 min massage + 15 min pause ends exactly at 11:15.
    const r4a = await post(booking(at(testDate, "10:00")));
    const r4b = await post(booking(at(testDate, "11:15")));
    check("4. 10:00 then 11:15 -> both 201", r4a.status === 201 && r4b.status === 201, `10:00 -> ${r4a.status}, 11:15 -> ${r4b.status}`);

    // 5. Cancel 10:00 in the database, then book 10:00 again.
    const first = r4a.body as { id?: string } | null;
    if (first?.id) {
      await db.booking.update({ where: { id: first.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    }
    const r5 = await post(booking(at(testDate, "10:00")));
    check("5. 10:00 cancelled, then 10:00 booked again -> 201", r5.status === 201, `10:00 after cancellation -> ${r5.status}`);
    await cleanup();

    // 6. Invalid phone number.
    const r6 = await post(booking(at(testDate, "14:00"), { customerPhone: "12345" }));
    check("6. invalid phone number -> 400", r6.status === 400, `${r6.status} ${JSON.stringify(r6.body)}`);

    // 7. Sunday.
    const r7 = await post(booking(at(sunday, "11:00")));
    check("7. slot on a Sunday -> 422", r7.status === 422, `${r7.status} ${JSON.stringify(r7.body)}`);
  } finally {
    await cleanup();
    const left = await db.booking.count({ where: { customerName: TEST_NAME } });
    console.log(`\nCleanup: ${left} test booking(s) left in the database.`);
    await db.$disconnect();
  }

  console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
