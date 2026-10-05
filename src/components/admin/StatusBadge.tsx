import { STATUS_LABEL, type BookingStatusValue } from "@/lib/booking-status";

const styles: Record<BookingStatusValue, string> = {
  CONFIRMED: "bg-olive/[0.07] text-olive ring-olive/20",
  COMPLETED: "bg-sand/50 text-ink-soft ring-sand",
  CANCELLED: "bg-red-50/70 text-red-700/80 ring-red-200/70",
};

const dots: Record<BookingStatusValue, string> = {
  CONFIRMED: "bg-olive",
  COMPLETED: "bg-muted",
  CANCELLED: "bg-red-400",
};

export default function StatusBadge({ status }: { status: BookingStatusValue }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium tracking-wide whitespace-nowrap ring-1 ring-inset ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
