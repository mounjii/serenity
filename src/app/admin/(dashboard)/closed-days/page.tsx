import { connection } from "next/server";
import ClosedDaysManager from "@/components/admin/ClosedDaysManager";
import { toLocalDateString } from "@/lib/time";
import { listUpcomingClosedDays } from "@/server/admin/closed-days";
import { requireArea } from "@/server/auth/session";

export default async function ClosedDaysPage() {
  await connection();
  await requireArea("closed");
  const days = await listUpcomingClosedDays();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Closed days</h1>
        <p className="mt-1 text-[0.85rem] text-sage">
        Holidays and exceptional closures. The salon is open every day, 10:00 – 22:00. A day with active reservations cannot be closed
        until they are cancelled.
        </p>
      </header>
      <ClosedDaysManager days={days} today={toLocalDateString(new Date())} />
    </div>
  );
}
