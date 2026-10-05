"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AdminBooking } from "@/server/admin/bookings";
import type { BookingChanges } from "@/server/admin/changes";
import BookingList from "./BookingList";

const POLL_INTERVAL_MS = 10_000;
const HIGHLIGHT_MS = 2 * 60_000;

const HighlightContext = createContext<ReadonlySet<string>>(new Set());

function titleFor(count: number): string {
  return `(${count}) New booking${count > 1 ? "s" : ""}`;
}

/**
 * Polls /api/admin/bookings/changes every 10 s while the tab is visible, always continuing from the
 * serverTime returned by the server. Any change refreshes the server-rendered page; new bookings are
 * highlighted and announced in the tab title.
 */
export default function LiveBookings({ initialSince, children }: { initialSince: string; children: React.ReactNode }) {
  const router = useRouter();
  const since = useRef(initialSince);
  const seen = useRef(new Map<string, string>());
  const inFlight = useRef(false);
  const baseTitle = useRef<string | null>(null);
  const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(new Set());
  const [unread, setUnread] = useState<AdminBooking[]>([]);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const poll = useCallback(async () => {
    if (inFlight.current || document.hidden) return;
    inFlight.current = true;
    const requestedSince = since.current;
    try {
      const res = await fetch(`/api/admin/bookings/changes?since=${encodeURIComponent(requestedSince)}`, { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BookingChanges;
      since.current = data.serverTime;
      setOnline(true);
      setLastSync(new Date());

      const fresh = data.bookings.filter((b) => seen.current.get(b.id) !== b.updatedAt);
      for (const b of fresh) seen.current.set(b.id, b.updatedAt);
      if (fresh.length === 0) return;

      const created = fresh.filter((b) => b.createdAt > requestedSince && b.status !== "CANCELLED");
      if (created.length > 0) {
        const ids = created.map((b) => b.id);
        setHighlighted((prev) => new Set([...prev, ...ids]));
        setUnread((prev) => [...prev, ...created.filter((c) => !prev.some((p) => p.id === c.id))]);
        window.setTimeout(() => {
          setHighlighted((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
        }, HIGHLIGHT_MS);
      }
      router.refresh();
    } catch {
      setOnline(false);
    } finally {
      inFlight.current = false;
    }
  }, [router]);

  useEffect(() => {
    let timer: number | undefined;
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        void poll();
        start();
      }
    };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [poll]);

  // Next.js rewrites <title> on navigation and refresh, so the unread count is re-applied whenever it changes.
  useEffect(() => {
    if (baseTitle.current === null) baseTitle.current = document.title;
    if (unread.length === 0) {
      if (document.title.startsWith("(")) document.title = baseTitle.current;
      return;
    }
    const wanted = titleFor(unread.length);
    const apply = () => {
      if (document.title !== wanted) document.title = wanted;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [unread]);

  return (
    <HighlightContext.Provider value={highlighted}>
      {unread.length > 0 && (
        <div role="status" className="mb-6 flex flex-col gap-3 rounded-sm border border-gold/50 bg-gold/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[0.9rem] text-ink">
            <p className="font-medium">{unread.length === 1 ? "New booking" : `${unread.length} new bookings`}</p>
            <ul className="mt-1 space-y-0.5 text-[0.82rem] text-ink-soft">
              {unread.slice(-3).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} onClick={() => setUnread([])} className="underline-offset-4 hover:underline">
                    {b.dateLabel} · {b.time} · {b.customerName} · {b.serviceName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setUnread([])}
            className="self-start rounded-full border border-ink/20 bg-white px-4 py-2 text-[0.75rem] text-ink transition hover:border-ink sm:self-center"
          >
            Mark as seen
          </button>
        </div>
      )}
      {children}
      <p className="mt-10 flex items-center gap-2 text-[0.72rem] text-muted" aria-live="polite">
        <span className={`h-2 w-2 rounded-full ${online ? "bg-olive" : "bg-red-500"}`} aria-hidden />
        {online ? "Live updates on" : "Connection lost, retrying…"}
        {lastSync && ` · last checked ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
      </p>
    </HighlightContext.Provider>
  );
}

type LiveBookingListProps = Omit<React.ComponentProps<typeof BookingList>, "highlightedIds">;

export function useHighlightedBookings() {
  return useContext(HighlightContext);
}

export function LiveBookingList(props: LiveBookingListProps) {
  const highlighted = useHighlightedBookings();
  return <BookingList {...props} highlightedIds={highlighted} />;
}
