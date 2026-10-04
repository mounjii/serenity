import { STATUS_LABEL, type BookingStatusValue } from "@/lib/booking-status";

const styles: Record<BookingStatusValue, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

export default function StatusBadge({ status }: { status: BookingStatusValue }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide ring-1 ring-inset ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
