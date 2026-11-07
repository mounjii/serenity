import Link from "next/link";
import { connection } from "next/server";
import { formatPhone } from "@/lib/phone";
import { listNotifications } from "@/server/admin/notifications";
import { requireArea } from "@/server/auth/session";

export default async function NotificationsPage() {
  await connection();
  await requireArea("notifications");
  const notifications = await listNotifications();
  const provider = process.env.WHATSAPP_PROVIDER?.trim() || "not set";

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">WhatsApp notifications</h1>
        <p className="mt-1 text-[0.85rem] text-sage">
        Last {notifications.length === 100 ? "100 " : ""}messages. Provider: <span className="font-medium text-ink">{provider}</span>
        {provider === "mock" && " (messages are simulated, nothing is actually sent)"}.
      </p>
      </header>

      {notifications.length === 0 ? (
        <p className="rounded-2xl border border-sand bg-white px-5 py-8 text-center text-[0.85rem] text-sage">No messages yet.</p>
      ) : (
        <ul className="divide-y divide-sand overflow-hidden rounded-2xl border border-sand bg-white">
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
