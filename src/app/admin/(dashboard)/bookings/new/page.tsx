import Link from "next/link";
import { connection } from "next/server";
import AdminBookingForm from "@/components/admin/AdminBookingForm";
import { toLocalDateString } from "@/lib/time";
import { requireAdminPage } from "@/server/auth/session";
import { getActiveServices } from "@/server/booking/services";

export default async function NewAdminBookingPage({ searchParams }: PageProps<"/admin/bookings/new">) {
  await connection();
  await requireAdminPage();
  const [{ date }, services] = await Promise.all([searchParams, getActiveServices()]);
  const today = toLocalDateString(new Date());

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[0.8rem] text-ink-soft hover:text-ink">← Back to dashboard</Link>
      <h1 className="mt-4 font-serif text-4xl text-ink">New booking</h1>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        For phone or walk-in customers. The 2-hour notice and 30-day limits do not apply here; opening hours, closed days and
        overlaps still do.
      </p>
      <AdminBookingForm services={services} today={today} initialDate={typeof date === "string" ? date : today} />
    </div>
  );
}
