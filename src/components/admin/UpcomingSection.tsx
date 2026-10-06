import Link from "next/link";
import { addDays, formatLongDate, isValidDateString } from "@/lib/time";
import type { AdminBooking } from "@/server/admin/bookings";
import UpcomingList from "./UpcomingList";

export type View = "today" | "tomorrow" | "week" | "date";

const FILTERS: { view: Exclude<View, "date">; label: string }[] = [
  { view: "today", label: "Today" },
  { view: "tomorrow", label: "Tomorrow" },
  { view: "week", label: "This week" },
];

type SearchParams = Record<string, string | string[] | undefined>;

/** Reads ?view=&date= and returns the date range to load plus the filter that should look active. */
export function resolveRange(params: SearchParams, today: string) {
  const requested = String(params.view);
  const view: View = ["today", "tomorrow", "week", "date"].includes(requested) ? (requested as View) : "week";
  const date = typeof params.date === "string" ? params.date : undefined;

  if (view === "today") return { view, date, from: today, to: today, title: "Today" };
  if (view === "tomorrow") {
    const d = addDays(today, 1);
    return { view, date, from: d, to: d, title: "Tomorrow" };
  }
  if (view === "date" && date && isValidDateString(date)) {
    return { view, date, from: date, to: date, title: formatLongDate(new Date(`${date}T12:00:00.000Z`)) };
  }
  return { view: "week" as const, date, from: today, to: addDays(today, 6), title: "Next 7 days" };
}

type Props = {
  basePath: string;
  range: ReturnType<typeof resolveRange>;
  bookings: AdminBooking[];
  today: string;
  heading?: string;
  /** Appended to the period links and the date form, e.g. "&status=confirmed". */
  extraQuery?: string;
};

export default function UpcomingSection({ basePath, range, bookings, today, heading = "Upcoming", extraQuery = "" }: Props) {
  const status = new URLSearchParams(extraQuery).get("status");
  return (
    <section id="upcoming" className="scroll-mt-28">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-[1.9rem] leading-tight text-ink">{heading}</h2>
          <p className="mt-1 text-[0.8rem] text-muted">{range.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-sand/80 bg-white p-1" role="group" aria-label="Period">
            {FILTERS.map((f) => (
              <Link
                key={f.view}
                href={`${basePath}?view=${f.view}${extraQuery}#upcoming`}
                aria-current={range.view === f.view ? "true" : undefined}
                className={`rounded-full px-4 py-1.5 text-[0.76rem] transition ${
                  range.view === f.view ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <form method="get" action={`${basePath}#upcoming`} className="flex items-center gap-1 rounded-full border border-sand/80 bg-white p-1 pl-3">
            <input type="hidden" name="view" value="date" />
            {status && <input type="hidden" name="status" value={status} />}
            <label htmlFor="filter-date" className="sr-only">
              Custom date
            </label>
            <input
              id="filter-date"
              type="date"
              name="date"
              defaultValue={range.view === "date" ? range.date : undefined}
              required
              className={`bg-transparent text-[0.76rem] outline-none ${range.view === "date" ? "text-ink" : "text-ink-soft"}`}
            />
            <button
              type="submit"
              className={`rounded-full px-4 py-1.5 text-[0.76rem] transition ${
                range.view === "date" ? "bg-ink text-cream" : "text-ink hover:bg-cream"
              }`}
            >
              Show
            </button>
          </form>
        </div>
      </div>

      <UpcomingList bookings={bookings} today={today} emptyText="No reservations for this period." />
    </section>
  );
}
