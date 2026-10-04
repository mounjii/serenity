import { formatLongDate, toLocalTimeString } from "@/lib/time";
import { getDb } from "@/server/db";

export type NotificationItem = {
  id: string;
  sentAt: string;
  recipient: "CUSTOMER" | "OWNER";
  phone: string;
  template: string;
  text: string;
  provider: string;
  status: "SENT" | "FAILED";
  error: string | null;
  bookingId: string;
  customerName: string;
};

function payloadText(payload: unknown): string {
  if (payload && typeof payload === "object" && "text" in payload && typeof payload.text === "string") return payload.text;
  return "";
}

export async function listNotifications(limit = 100): Promise<NotificationItem[]> {
  const rows = await getDb().notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { booking: { select: { customerName: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    sentAt: `${formatLongDate(row.createdAt)}, ${toLocalTimeString(row.createdAt)}`,
    recipient: row.recipient,
    phone: row.phone,
    template: row.template,
    text: payloadText(row.payload),
    provider: row.provider,
    status: row.status,
    error: row.error,
    bookingId: row.bookingId,
    customerName: row.booking.customerName,
  }));
}
