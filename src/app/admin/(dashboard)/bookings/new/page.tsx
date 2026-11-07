import Link from "next/link";
import { connection } from "next/server";
import AdminBookingForm from "@/components/admin/AdminBookingForm";
import { toLocalDateString } from "@/lib/time";
import { requireArea } from "@/server/auth/session";
import { getActiveServices } from "@/server/booking/services";

export default async function NewAdminBookingPage({ searchParams }: PageProps<"/admin/bookings/new">) {
  await connection();
  await requireArea("bookings");
  const [{ date }, services] = await Promise.all([searchParams, getActiveServices()]);
  const today = toLocalDateString(new Date());

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <Link href="/admin" className="text-[0.8rem] text-sage hover:text-forest">← Back to dashboard</Link>
        <h1 className="mt-3 text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">New booking</h1>
        <p className="mt-1 text-[0.85rem] text-sage">
        For phone or walk-in customers. The 2-hour notice and 30-day limits do not apply here; opening hours, closed days and
        overlaps still do.
        </p>
      </header>
      <AdminBookingForm services={services} today={today} initialDate={typeof date === "string" ? date : today} />
    </div>
  );
}
