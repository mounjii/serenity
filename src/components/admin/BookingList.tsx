import type { AdminBooking } from "@/server/admin/bookings";
import BookingRow from "./BookingRow";

type Props = { bookings: AdminBooking[]; emptyText: string; showDate?: boolean; highlightedIds?: ReadonlySet<string> };

export default function BookingList({ bookings, emptyText, showDate = false, highlightedIds }: Props) {
  if (bookings.length === 0) {
    return <p className="rounded-md border border-sand/70 bg-white px-6 py-10 text-center text-[0.85rem] text-muted">{emptyText}</p>;
  }
  return (
    <ul className="grid gap-3 sm:gap-0 sm:divide-y sm:divide-sand/70 sm:overflow-hidden sm:rounded-md sm:border sm:border-sand/70 sm:bg-white">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} showDate={showDate} highlighted={highlightedIds?.has(b.id) ?? false} />
      ))}
    </ul>
  );
}
