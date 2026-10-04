"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addClosedDayAction, removeClosedDayAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import type { AdminBooking } from "@/server/admin/bookings";
import type { ClosedDayItem } from "@/server/admin/closed-days";

const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-ink";

export default function ClosedDaysManager({ days, today }: { days: ClosedDayItem[]; today: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<AdminBooking[]>([]);
  const [pending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setConflicts([]);
    if (!date) {
      setError("Please choose a date.");
      return;
    }
    startTransition(async () => {
      const result = await addClosedDayAction({ date, reason });
      if (result.ok) {
        setDate("");
        setReason("");
        router.refresh();
        return;
      }
      if (result.error.status === 401) {
        router.push("/admin/login");
        return;
      }
      setError(result.error.fields?.date ?? result.error.message);
      setConflicts(result.error.bookings ?? []);
    });
  };

  const remove = (id: string) => {
    setError(null);
    setRemovingId(id);
    startTransition(async () => {
      const result = await removeClosedDayAction(id);
      if (!result.ok) {
        if (result.error.status === 401) {
          router.push("/admin/login");
          return;
        }
        setError(result.error.message);
      }
      setRemovingId(null);
      router.refresh();
    });
  };

  return (
    <div className="mt-8 space-y-8">
      <form onSubmit={add} className="rounded-sm bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-8">
        <h2 className="font-serif text-2xl text-ink">Close a day</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-[12rem_1fr]">
          <div>
            <label htmlFor="closed-date" className="mb-1.5 block text-[0.8rem]">Date</label>
            <input id="closed-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="closed-reason" className="mb-1.5 block text-[0.8rem]">Reason (optional)</label>
            <input
              id="closed-reason"
              value={reason}
              maxLength={200}
              placeholder="e.g. Public holiday"
              onChange={(e) => setReason(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {error && (
          <div role="alert" className="mt-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
            <p>{error}</p>
            {conflicts.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {conflicts.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings/${b.id}`} className="underline underline-offset-4 hover:text-red-900">
                      {b.time} · {b.customerName} · {b.serviceName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={pending && removingId === null}>Close this day</Button>
        </div>
      </form>

      <section>
        <h2 className="mb-4 font-serif text-2xl text-ink">Upcoming closed days</h2>
        {days.length === 0 ? (
          <p className="rounded-sm bg-white px-5 py-8 text-center text-[0.85rem] text-muted">No closed days planned.</p>
        ) : (
          <ul className="divide-y divide-sand/70 overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)]">
            {days.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-ink">{d.label}</p>
                  {d.reason && <p className="text-[0.8rem] text-muted">{d.reason}</p>}
                </div>
                <Button variant="outline" size="sm" loading={removingId === d.id} disabled={pending} onClick={() => remove(d.id)}>
                  Reopen
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
