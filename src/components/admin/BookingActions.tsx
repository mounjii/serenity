"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelBookingAction, completeBookingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { canCancel, canComplete } from "@/lib/booking-status";
import type { AdminBooking } from "@/server/admin/bookings";
import type { ActionResult } from "@/server/admin/action-result";

export default function BookingActions({ booking }: { booking: AdminBooking }) {
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"cancel" | "complete" | null>(null);

  const now = new Date();
  const cancellable = canCancel(booking, now);
  const completable = canComplete(booking, now);

  const run = (kind: "cancel" | "complete", action: () => Promise<ActionResult<AdminBooking>>) => {
    setError(null);
    setPendingAction(kind);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        if (result.error.status === 401) {
          router.push("/admin/login");
          return;
        }
        setError(result.error.message);
      }
      setConfirmingCancel(false);
      router.refresh();
    });
  };

  if (!cancellable && !completable) {
    return (
      <p className="text-[0.85rem] text-muted">
        {booking.status === "CONFIRMED" ? "No actions available." : "This reservation is closed. No further actions are available."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {confirmingCancel ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-[0.9rem] text-red-800">Cancel this reservation? The customer will be notified.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="danger" size="sm" loading={pending && pendingAction === "cancel"} onClick={() => run("cancel", () => cancelBookingAction(booking.id))}>
              Yes, cancel reservation
            </Button>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirmingCancel(false)}>
              Keep reservation
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {completable && (
            <Button size="sm" loading={pending && pendingAction === "complete"} onClick={() => run("complete", () => completeBookingAction(booking.id))}>
              Mark as completed
            </Button>
          )}
          {cancellable && (
            <Button variant="danger" size="sm" disabled={pending} onClick={() => setConfirmingCancel(true)}>
              Cancel reservation
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-[0.85rem] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
