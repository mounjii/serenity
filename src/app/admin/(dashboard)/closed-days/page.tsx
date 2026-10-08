import { connection } from "next/server";
import ClosedDaysManager from "@/components/admin/ClosedDaysManager";
import { toLocalDateString } from "@/lib/time";
import { listUpcomingClosedDays } from "@/server/admin/closed-days";
import { requireAdminPage } from "@/server/auth/session";

export default async function ClosedDaysPage() {
  await connection();
  await requireAdminPage();
  const days = await listUpcomingClosedDays();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl text-ink">Closed days</h1>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        Holidays and exceptional closures. The salon is open every day, 10:00 – 22:00. A day with active reservations cannot be closed
        until they are cancelled.
      </p>
      <ClosedDaysManager days={days} today={toLocalDateString(new Date())} />
    </div>
  );
}
