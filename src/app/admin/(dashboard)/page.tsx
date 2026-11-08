import Link from "next/link";
import { connection } from "next/server";
import BookingDetailsProvider from "@/components/admin/BookingDetails";
import {
  Card,
  NextAppointmentCard,
  RecentActivity,
  TodaySchedule,
  UpcomingAppointments,
} from "@/components/admin/DashboardWidgets";
import { resolveRange } from "@/components/admin/UpcomingSection";
import {
  BellIcon,
  CalendarIcon,
  CalendarOffIcon,
  CheckCircleIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  PlusIcon,
  TrendIcon,
} from "@/components/Icons";
import { formatPrice } from "@/lib/format";
import { addDays, formatDayHeading, isValidDateString, toLocalMinuteOfDay, weekdayOf } from "@/lib/time";
import { listActivity } from "@/server/admin/activity";
import { getDashboardSummary, listBookingsForDates, type AdminBooking } from "@/server/admin/bookings";
import { requireArea } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getWhatsAppMode } from "@/server/whatsapp";

export const metadata = { title: "Dashboard — THAI PRAKHOP" };

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
  const session = await requireArea("dashboard");
  await sweepExpiredBookings();
  const params = await searchParams;
  const now = new Date();

  const summary = await getDashboardSummary(now);
  const today = summary.today;
  const range = resolveRange(params, today);
  const month = resolveMonth(params.month, today);
  const monthStart = `${month}-01`;
  const monthEnd = addDays(`${shiftMonth(month, 1)}-01`, -1);

  const [todayBookings, rangeBookings, monthBookings, activity] = await Promise.all([
    listBookingsForDates(today, today),
    listBookingsForDates(range.from, range.to),
    listBookingsForDates(monthStart, monthEnd),
    listActivity(6, now),
  ]);
  const next = summary.nextBooking;
  const confirmed = todayBookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;

  return (
    <BookingDetailsProvider bookings={uniqueById([todayBookings, rangeBookings, activity.map((e) => e.booking), [next]])} whatsappMode={getWhatsAppMode()}>
      <div className="space-y-5 sm:space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">
              {greeting(now)}, {session.username}
            </h1>
            <p className="mt-1 text-[0.85rem] text-sage">
              {summary.weekCount} booking{summary.weekCount === 1 ? "" : "s"} this week
              {summary.todayRevenueCents > 0 ? ` · ${formatPrice(summary.todayRevenueCents)} today` : ""}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-2 text-[0.78rem] text-ink">
              <CalendarIcon className="h-4 w-4 text-sage" />
              {formatDayHeading(today, true).replace(" · ", ", ")}
            </p>
            <Link
              href="/admin/bookings/new"
              className="hidden items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.84rem] font-medium text-white transition hover:bg-forest-dark sm:inline-flex"
            >
              <PlusIcon className="h-4 w-4" />
              New booking
            </Link>
          </div>
        </header>

        <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <div className="col-span-2 xl:order-last xl:col-span-1">
            <NextAppointmentCard booking={next} isToday={next?.date === today} />
          </div>
          <Stat
            tone="peach"
            icon={<CalendarIcon className="h-[1.1rem] w-[1.1rem]" />}
            label="Total bookings"
            short="Total"
            value={todayBookings.length}
            href="/admin/bookings?view=today"
          />
          <Stat
            tone="green"
            icon={<CheckCircleIcon className="h-[1.1rem] w-[1.1rem]" />}
            label="Confirmed"
            value={confirmed}
            href="/admin/bookings?view=today&status=confirmed"
          />
          <Stat
            tone="gold"
            icon={<ClockIcon className="h-[1.1rem] w-[1.1rem]" />}
            label="Waiting"
            value={summary.pendingCount}
            href="/admin/bookings?status=waiting"
          />
          <Stat
            tone="blue"
            icon={<TrendIcon className="h-[1.1rem] w-[1.1rem]" />}
            label="Today’s revenue"
            short="Revenue"
            value={formatPrice(summary.todayRevenueCents)}
            href="/admin/bookings?view=today"
          />
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
              <RecentActivity events={activity} />
            </div>
          </div>
        </div>
      </div>
    </BookingDetailsProvider>
  );
}

const tones = {
  peach: { card: "border-sand bg-white hover:border-black/25", icon: "bg-ivory text-ink" },
  green: { card: "border-sand bg-white hover:border-black/25", icon: "bg-ivory text-ink" },
  gold: { card: "border-sand bg-white hover:border-black/25", icon: "bg-ivory text-ink" },
  blue: { card: "border-sand bg-white hover:border-black/25", icon: "bg-ivory text-ink" },
};

function Stat({
  tone,
  icon,
  label,
  short,
  value,
  href,
}: {
  tone: keyof typeof tones;
  icon: React.ReactNode;
  label: string;
  short?: string;
  value: number | string;
  href: string;
}) {
  const t = tones[tone];
  return (
    <Link href={href} className={`group relative block rounded-2xl border p-3.5 transition sm:p-5 ${t.card}`}>
      <ChevronRight className="absolute top-4 right-3 h-4 w-4 text-sage transition group-hover:translate-x-0.5 group-hover:text-ink sm:top-5 sm:right-4" />
      <span className={`grid h-8 w-8 place-items-center rounded-full sm:h-9 sm:w-9 ${t.icon}`}>{icon}</span>
      <p className="mt-3 truncate text-[0.74rem] text-sage sm:text-[0.78rem]">
        {short ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </p>
      <p className="mt-1 text-[1.7rem] leading-none font-semibold tracking-[-0.03em] text-ink lining-nums tabular-nums sm:text-[2rem]">{value}</p>
      <p className="mt-2 hidden text-[0.74rem] text-sage underline-offset-4 group-hover:underline sm:block">View bookings</p>
    </Link>
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
  const arrow = "grid h-8 w-8 place-items-center rounded-full border border-sand text-ink transition hover:border-forest/30";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-semibold tracking-[-0.02em] text-ink">
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
                  isToday ? "bg-forest text-white" : date < today ? "text-sage group-hover:bg-forest/5" : "text-ink group-hover:bg-forest/5"
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
      <h2 className="text-[1rem] font-semibold tracking-[-0.02em] text-ink">Quick actions</h2>
      <div className="mt-3 space-y-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-full border border-sand bg-white px-3 py-2.5 text-[0.8rem] text-ink transition hover:border-forest/30"
          >
            <a.icon className="h-4 w-4 text-sage" />
            <span className="flex-1">{a.label}</span>
            <ChevronRight className="h-4 w-4 text-sage transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
