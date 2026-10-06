import { formatShortDate } from "@/lib/time";
import { getDb } from "@/server/db";
import { adminBookingSelect, toAdminBooking, type AdminBooking } from "./bookings";

export type ActivityKind = "created" | "confirmed" | "cancelled" | "completed";
export type ActivityTone = "green" | "red" | "amber" | "grey" | "blue";

export type ActivityEvent = {
  key: string;
  kind: ActivityKind;
  at: string;
  title: string;
  detail: string;
  tone: ActivityTone;
  ago: string;
  booking: AdminBooking;
};

/** Created and confirmed within this gap means the admin added it already confirmed: one event, not two. */
const SAME_ACTION_MS = 5_000;

export function timeAgo(iso: string, now = new Date()): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function eventsOf(b: AdminBooking, now: Date): ActivityEvent[] {
  const detail = `${b.customerName} · ${b.serviceName} · ${formatShortDate(b.date)} at ${b.time}`;
  const make = (kind: ActivityKind, at: string, title: string, tone: ActivityTone): ActivityEvent => ({
    key: `${b.id}-${kind}`,
    kind,
    at,
    title,
    detail,
    tone,
    ago: timeAgo(at, now),
    booking: b,
  });

  const events = [make("created", b.createdAt, b.source === "ADMIN" ? "Booking added by you" : "New online booking", b.source === "ADMIN" ? "blue" : "amber")];
  if (b.confirmedAt && new Date(b.confirmedAt).getTime() - new Date(b.createdAt).getTime() > SAME_ACTION_MS) {
    events.push(make("confirmed", b.confirmedAt, "Booking confirmed", "green"));
  }
  if (b.cancelledAt) {
    const title =
      b.cancelReason === "EXPIRED"
        ? "Auto-cancelled · no reply"
        : b.cancelReason === "CUSTOMER"
          ? "Cancelled by the client"
          : "Cancelled by you";
    events.push(make("cancelled", b.cancelledAt, title, "red"));
  }
  if (b.completedAt) events.push(make("completed", b.completedAt, "Session completed", "grey"));
  return events;
}

/**
 * Every booking event (created, confirmed, cancelled, completed) rebuilt from the booking timestamps, newest first.
 * Each event also bumps updatedAt, so the most recently updated bookings hold the most recent events.
 */
export async function listActivity(limit: number, now = new Date()): Promise<ActivityEvent[]> {
  const rows = await getDb().booking.findMany({ orderBy: { updatedAt: "desc" }, take: limit, select: adminBookingSelect });
  return rows
    .map(toAdminBooking)
    .flatMap((b) => eventsOf(b, now))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}
