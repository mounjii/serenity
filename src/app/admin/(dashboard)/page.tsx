import Link from "next/link";
import { connection } from "next/server";
import BookingDetailsProvider from "@/components/admin/BookingDetails";
import {
  Card,
  NextAppointmentCard,
  RecentActivity,
  TodaySchedule,
  UpcomingAppointments,
  type ActivityItem,
} from "@/components/admin/DashboardWidgets";
import { resolveRange } from "@/components/admin/UpcomingSection";
import {
  BellIcon,
  CalendarIcon,
  CalendarOffIcon,
  CheckCircleIcon,
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  TrendIcon,
  XCircleIcon,
} from "@/components/Icons";
import { addDays, formatDayHeading, isValidDateString, toLocalMinuteOfDay, weekdayOf } from "@/lib/time";
import { getDashboardSummary, listBookingsForDates, listRecentlyUpdated, type AdminBooking } from "@/server/admin/bookings";
import { requireAdminPage } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getWhatsAppMode } from "@/server/whatsapp";

export const metadata = { title: "Dashboard — Touch Sense" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function uniqueById(lists: (AdminBooking | null)[][]): AdminBooking[] {
  const map = new Map<string, AdminBooking>();
  for (const list of lists) for (const b of list) if (b) map.set(b.id, b);
  return [...map.values()];
}

function greeting(now: Date): string {
  const hour = Math.floor(toLocalMinuteOfDay(now) / 60);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function activityOf(b: AdminBooking, now: Date): ActivityItem {
  const ago = timeAgo(b.updatedAt, now);
  if (b.status === "CANCELLED") return { booking: b, title: "Booking cancelled", tone: "red", ago };
  if (b.status === "COMPLETED") return { booking: b, title: "Session completed", tone: "grey", ago };
  if (b.status === "CONFIRMED") return { booking: b, title: b.source === "ADMIN" ? "Booking added" : "Booking confirmed", tone: "green", ago };
  return { booking: b, title: "New booking", tone: "amber", ago };
}

/** "YYYY-MM" from ?month=, falling back to the month of today. */
function resolveMonth(param: string | string[] | undefined, today: string): string {
  return typeof param === "string" && /^\d{4}-\d{2}$/.test(param) && isValidDateString(`${param}-01`) ? param : today.slice(0, 7);
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  const session = await requireAdminPage();
  await sweepExpiredBookings();
  const params = await searchParams;
  const now = new Date();

  const summary = await getDashboardSummary(now);
  const today = summary.today;
  const range = resolveRange(params, today);
  const month = resolveMonth(params.month, today);
  const monthStart = `${month}-01`;
  const monthEnd = addDays(`${shiftMonth(month, 1)}-01`, -1);
  const weekStart = addDays(today, -6);

  const [history, rangeBookings, monthBookings, recent] = await Promise.all([
    listBookingsForDates(weekStart, today),
    listBookingsForDates(range.from, range.to),
    listBookingsForDates(monthStart, monthEnd),
    listRecentlyUpdated(5),
  ]);
  const todayBookings = history.filter((b) => b.date === today);
  const next = summary.nextBooking;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const series = (keep: (b: AdminBooking) => boolean) => days.map((d) => history.filter((b) => b.date === d && keep(b)).length);
  const totalSeries = series(() => true);
  const confirmedSeries = series((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
  const cancelledSeries = series((b) => b.status === "CANCELLED");
  const total = totalSeries[6];
  const confirmed = confirmedSeries[6];
  const cancelled = cancelledSeries[6];
  const diff = total - totalSeries[5];
  const share = (n: number) => (total === 0 ? "No bookings yet" : `${Math.round((n / total) * 100)}% of today`);

  return (
    <BookingDetailsProvider bookings={uniqueById([history, rangeBookings, recent, [next]])} whatsappMode={getWhatsAppMode()}>
      <div className="space-y-5 sm:space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-[1.85rem] leading-tight text-ink sm:text-[2.2rem]">
              {greeting(now)}, {session.username} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-[0.85rem] text-ink-soft">Here’s an overview of your bookings today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
            <p className="inline-flex items-center gap-2 rounded-lg border border-sand/80 bg-white px-3.5 py-2 text-[0.78rem] text-ink">
              <CalendarIcon className="h-4 w-4 text-ink-soft" />
              {formatDayHeading(today, true).replace(" · ", ", ")}
            </p>
            <Link
              href="/admin/bookings/new"
              className="hidden items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[0.8rem] text-cream transition hover:bg-black sm:inline-flex"
            >
              <PlusIcon className="h-4 w-4" />
              New booking
            </Link>
          </div>
        </header>

        <section aria-label="Summary" className="grid grid-cols-3 gap-3 sm:gap-4 xl:grid-cols-4">
          <div className="col-span-3 xl:order-last xl:col-span-1">
            <NextAppointmentCard booking={next} isToday={next?.date === today} />
          </div>
          <Stat
            tone="peach"
            icon={<CalendarIcon className="h-[1.1rem] w-[1.1rem]" />}
            label="Total bookings"
            short="Total"
            value={total}
            series={totalSeries}
            caption={
              diff === 0 ? (
                "Same as yesterday"
              ) : (
                <span className={diff > 0 ? "text-olive" : "text-red-600/80"}>
                  <TrendIcon className={`mr-1 inline h-3 w-3 ${diff < 0 ? "rotate-90" : ""}`} />
                  {diff > 0 ? `+${diff}` : diff} <span className="text-ink-soft">vs yesterday</span>
                </span>
              )
            }
          />
          <Stat tone="green" icon={<CheckCircleIcon className="h-[1.1rem] w-[1.1rem]" />} label="Confirmed" value={confirmed} series={confirmedSeries} caption={share(confirmed)} />
          <Stat tone="rose" icon={<XCircleIcon className="h-[1.1rem] w-[1.1rem]" />} label="Cancelled" value={cancelled} series={cancelledSeries} caption={share(cancelled)} />
        </section>

        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <TodaySchedule bookings={todayBookings} dateLabel={formatDayHeading(today, true).replace(" · ", ", ")} />
            <UpcomingAppointments range={range} bookings={rangeBookings} />
          </div>

          <div className="grid content-start gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-1">
            <MiniCalendar month={month} today={today} bookings={monthBookings} />
            <div className="space-y-5 sm:space-y-6">
              <QuickActions />
              <RecentActivity items={recent.map((b) => activityOf(b, now))} />
            </div>
          </div>
        </div>
      </div>
    </BookingDetailsProvider>
  );
}

const tones = {
  peach: { card: "border-[#f2e2cf] bg-[#fdf6ee]", icon: "bg-[#f8e3cb] text-[#b0733a]", line: "#d39a5c" },
  green: { card: "border-[#dfe9d8] bg-[#f3f7f0]", icon: "bg-[#dfead6] text-olive", line: "#6f8f5c" },
  rose: { card: "border-[#f3dcdc] bg-[#fdf3f3]", icon: "bg-[#f8dede] text-[#b4505a]", line: "#d47a83" },
};

function Stat({
  tone,
  icon,
  label,
  short,
  value,
  series,
  caption,
}: {
  tone: keyof typeof tones;
  icon: React.ReactNode;
  label: string;
  short?: string;
  value: number;
  series: number[];
  caption: React.ReactNode;
}) {
  const t = tones[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-3.5 sm:p-5 ${t.card}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg sm:h-9 sm:w-9 ${t.icon}`}>{icon}</span>
      <p className="mt-3 truncate text-[0.74rem] text-ink-soft sm:text-[0.78rem]">
        {short ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </p>
      <p className="mt-1 font-serif text-[2rem] leading-none text-ink lining-nums tabular-nums sm:text-[2.3rem]">{value}</p>
      <p className="mt-2 hidden text-[0.74rem] text-ink-soft sm:block">{caption}</p>
      <Sparkline values={series} color={t.line} />
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96;
  const h = 34;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - (v / max) * (h - 6)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="absolute right-4 bottom-4 hidden h-[34px] w-24 sm:block" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniCalendar({ month, today, bookings }: { month: string; today: string; bookings: AdminBooking[] }) {
  const first = `${month}-01`;
  const offset = (weekdayOf(first) + 6) % 7;
  const nextMonth = `${shiftMonth(month, 1)}-01`;
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let d = first; d < nextMonth; d = addDays(d, 1)) cells.push(d);

  const perDay = new Map<string, { active: number; cancelled: number }>();
  for (const b of bookings) {
    const entry = perDay.get(b.date) ?? { active: 0, cancelled: 0 };
    if (b.status === "CANCELLED") entry.cancelled++;
    else entry.active++;
    perDay.set(b.date, entry);
  }
  const [y, m] = month.split("-").map(Number);
  const arrow = "grid h-8 w-8 place-items-center rounded-lg border border-sand/80 text-ink transition hover:border-ink/40";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-medium text-ink">
          {MONTHS[m - 1]} {y}
        </h2>
        <div className="flex gap-1.5">
          <Link href={`/admin?month=${shiftMonth(month, -1)}`} scroll={false} aria-label="Previous month" className={arrow}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={`/admin?month=${shiftMonth(month, 1)}`} scroll={false} aria-label="Next month" className={arrow}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[0.68rem] text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="pb-2">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const counts = perDay.get(date);
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={`/admin/bookings?view=date&date=${date}`}
              aria-label={`${date}${counts ? `, ${counts.active} booking${counts.active === 1 ? "" : "s"}` : ""}`}
              className="group flex flex-col items-center py-0.5"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-[0.8rem] lining-nums tabular-nums transition ${
                  isToday ? "bg-ink text-cream" : date < today ? "text-muted group-hover:bg-cream" : "text-ink group-hover:bg-cream"
                }`}
              >
                {Number(date.slice(8))}
              </span>
              <span className="mt-0.5 flex h-1 gap-0.5">
                {counts && counts.active > 0 && <span className="h-1 w-1 rounded-full bg-olive" />}
                {counts && counts.active > 1 && <span className="h-1 w-1 rounded-full bg-olive" />}
                {counts && counts.cancelled > 0 && <span className="h-1 w-1 rounded-full bg-red-400" />}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { href: "/admin/bookings/new", label: "New booking", icon: PlusIcon },
    { href: "/admin/closed-days", label: "Block closed day", icon: CalendarOffIcon },
    { href: "/admin/notifications", label: "Notifications log", icon: BellIcon },
  ];
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-[1rem] font-medium text-ink">Quick actions</h2>
      <div className="mt-3 space-y-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-lg border border-sand/70 px-3 py-2.5 text-[0.8rem] text-ink transition hover:border-ink/30 hover:bg-cream/50"
          >
            <a.icon className="h-4 w-4 text-ink-soft" />
            <span className="flex-1">{a.label}</span>
            <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
