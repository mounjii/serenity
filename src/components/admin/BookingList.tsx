import type { AdminBooking } from "@/server/admin/bookings";
import BookingRow from "./BookingRow";

type Props = { bookings: AdminBooking[]; emptyText: string; showDate?: boolean; highlightedIds?: ReadonlySet<string> };

export default function BookingList({ bookings, emptyText, showDate = false, highlightedIds }: Props) {
  if (bookings.length === 0) {
    return <p className="rounded-sm bg-white px-5 py-8 text-center text-[0.85rem] text-muted">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-sand/70 overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)]">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} showDate={showDate} highlighted={highlightedIds?.has(b.id) ?? false} />
      ))}
    </ul>
  );
}
