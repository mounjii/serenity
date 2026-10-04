import Link from "next/link";
import { connection } from "next/server";
import { formatPhone } from "@/lib/phone";
import { listNotifications } from "@/server/admin/notifications";
import { requireAdminPage } from "@/server/auth/session";

export default async function NotificationsPage() {
  await connection();
  await requireAdminPage();
  const notifications = await listNotifications();
  const provider = process.env.WHATSAPP_PROVIDER?.trim() || "not set";

  return (
    <div>
      <h1 className="font-serif text-4xl text-ink">WhatsApp notifications</h1>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        Last {notifications.length === 100 ? "100 " : ""}messages. Provider: <span className="font-medium text-ink">{provider}</span>
        {provider === "mock" && " (messages are simulated, nothing is actually sent)"}.
      </p>

      {notifications.length === 0 ? (
        <p className="mt-8 rounded-sm bg-white px-5 py-8 text-center text-[0.85rem] text-muted">No messages yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-sand/70 overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)]">
          {notifications.map((n) => (
            <li key={n.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem]">
                <span className="text-muted">{n.sentAt}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset ${
                    n.status === "SENT" ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"
                  }`}
                >
                  {n.status === "SENT" ? "Sent" : "Failed"}
                </span>
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-ink-soft">{n.recipient === "OWNER" ? "To owner" : "To customer"}</span>
                <span className="text-ink">{n.phone ? formatPhone(n.phone) : "no number"}</span>
                <Link href={`/admin/bookings/${n.bookingId}`} className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                  Reservation of {n.customerName}
                </Link>
              </div>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-ink">{n.text}</p>
              {n.error && <p className="mt-1 text-[0.78rem] text-red-700">Error: {n.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
