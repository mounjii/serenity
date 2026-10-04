import Link from "next/link";
import { connection } from "next/server";
import { LiveBookingList } from "@/components/admin/LiveBookings";
import StatusBadge from "@/components/admin/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { addDays, formatLongDate, isValidDateString } from "@/lib/time";
import { getDashboardSummary, listBookingsForDates } from "@/server/admin/bookings";
import { requireAdminPage } from "@/server/auth/session";

type View = "today" | "tomorrow" | "week" | "date";

const FILTERS: { view: Exclude<View, "date">; label: string }[] = [
  { view: "today", label: "Today" },
  { view: "tomorrow", label: "Tomorrow" },
  { view: "week", label: "This week" },
];

function resolveRange(view: View, today: string, date: string | undefined) {
  switch (view) {
    case "today":
      return { from: today, to: today, title: "Today" };
    case "tomorrow": {
      const d = addDays(today, 1);
      return { from: d, to: d, title: "Tomorrow" };
    }
    case "date":
      if (date && isValidDateString(date)) return { from: date, to: date, title: formatLongDate(new Date(`${date}T12:00:00.000Z`)) };
      return { from: today, to: addDays(today, 6), title: "This week" };
    default:
      return { from: today, to: addDays(today, 6), title: "This week (next 7 days)" };
  }
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  await requireAdminPage();
  const params = await searchParams;
  const view: View = ["today", "tomorrow", "week", "date"].includes(String(params.view)) ? (params.view as View) : "week";
  const customDate = typeof params.date === "string" ? params.date : undefined;

  const summary = await getDashboardSummary();
  const range = resolveRange(view, summary.today, customDate);
  const [todayBookings, rangeBookings] = await Promise.all([
    listBookingsForDates(summary.today, summary.today),
    listBookingsForDates(range.from, range.to),
  ]);
  const next = summary.nextBooking;
  const activeView = view === "date" && !(customDate && isValidDateString(customDate)) ? "week" : view;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{formatLongDate(new Date())}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">Dashboard</h1>
        </div>
        <ButtonLink href="/admin/bookings/new" size="sm">+ New booking</ButtonLink>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)]">
          <p className="text-[0.72rem] tracking-[0.2em] text-muted uppercase">Today</p>
          <p className="mt-2 font-serif text-5xl text-ink">{summary.todayCount}</p>
          <p className="mt-1 text-[0.8rem] text-ink-soft">reservation{summary.todayCount === 1 ? "" : "s"} (not cancelled)</p>
        </div>
        <div className="rounded-sm bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:col-span-2">
          <p className="text-[0.72rem] tracking-[0.2em] text-muted uppercase">Next reservation</p>
          {next ? (
            <Link href={`/admin/bookings/${next.id}`} className="group mt-2 block">
              <p className="font-serif text-3xl text-ink group-hover:underline">
                {next.time} <span className="text-xl text-ink-soft">· {next.dateLabel}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-soft">
                {next.customerName} · {next.serviceName} <StatusBadge status={next.status} />
              </p>
            </Link>
          ) : (
            <p className="mt-3 text-[0.9rem] text-muted">No upcoming reservations.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl text-ink">Today</h2>
        <LiveBookingList bookings={todayBookings} emptyText="No reservations today." />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-serif text-2xl text-ink">Upcoming · {range.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.view}
                href={`/admin?view=${f.view}`}
                className={`rounded-full px-4 py-2 text-[0.78rem] transition ${
                  activeView === f.view ? "bg-olive text-white" : "border border-sand bg-white text-ink hover:border-olive"
                }`}
              >
                {f.label}
              </Link>
            ))}
            <form method="get" action="/admin" className="flex items-center gap-2">
              <input type="hidden" name="view" value="date" />
              <label htmlFor="filter-date" className="sr-only">Custom date</label>
              <input
                id="filter-date"
                type="date"
                name="date"
                defaultValue={activeView === "date" ? customDate : undefined}
                required
                className={`rounded-full border bg-white px-4 py-1.5 text-[0.78rem] outline-none focus:border-ink ${
                  activeView === "date" ? "border-ink" : "border-sand"
                }`}
              />
              <button type="submit" className="rounded-full border border-sand bg-white px-4 py-2 text-[0.78rem] transition hover:border-ink">
                Show
              </button>
            </form>
          </div>
        </div>
        <LiveBookingList bookings={rangeBookings} emptyText="No reservations for this period." showDate={range.from !== range.to} />
      </section>
    </div>
  );
}
