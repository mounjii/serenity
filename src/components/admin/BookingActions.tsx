"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelBookingAction, completeBookingAction, confirmBookingAction, simulateCustomerReplyAction } from "@/app/admin/actions";
import { WhatsAppIcon } from "@/components/Icons";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { canCancel, canComplete, canConfirm } from "@/lib/booking-status";
import { whatsappLink } from "@/lib/phone";
import { ownerCancelledText, ownerConfirmedText, ownerRequestText } from "@/lib/whatsapp-text";
import type { AdminBooking } from "@/server/admin/bookings";
import type { ActionResult } from "@/server/admin/action-result";
import type { WhatsAppMode } from "@/server/whatsapp";

type ActionKind = "cancel" | "complete" | "confirm" | "client-confirm" | "client-cancel";

export default function BookingActions({ booking, whatsappMode = "mock" }: { booking: AdminBooking; whatsappMode?: WhatsAppMode }) {
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);

  const now = new Date();
  const cancellable = canCancel(booking, now);
  const completable = canComplete(booking, now);
  const confirmable = canConfirm(booking, now);
  const waitingUntil = booking.labels.confirmUntil;
  const manual = whatsappMode === "manual";
  const messageInfo = {
    customerName: booking.customerName,
    serviceName: booking.client.serviceName,
    date: booking.client.dateLabel,
    time: booking.time,
    bookingId: booking.id,
    locale: booking.client.locale,
  };
  const whatsappMessage =
    whatsappMode === "meta"
      ? null
      : booking.status === "PENDING"
        ? { label: "Ask client to confirm", text: ownerRequestText(messageInfo) }
        : booking.status === "CONFIRMED" && new Date(booking.startAt) > now
          ? { label: "Send confirmation", text: ownerConfirmedText(messageInfo) }
          : booking.status === "CANCELLED" && new Date(booking.startAt) > now
            ? { label: "Send cancellation", text: ownerCancelledText(messageInfo) }
            : null;
  const whatsappButton = whatsappMessage && (
    <ButtonAnchor
      href={whatsappLink(booking.customerPhone, whatsappMessage.text)}
      target="_blank"
      rel="noopener noreferrer"
      variant="outline"
      size="sm"
    >
      <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
      {whatsappMessage.label}
      {booking.client.locale !== "en" && <span className="text-[0.68rem] text-muted">({booking.client.locale.toUpperCase()})</span>}
    </ButtonAnchor>
  );

  const run = (kind: ActionKind, action: () => Promise<ActionResult<unknown>>) => {
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

  if (!cancellable && !completable && !confirmable) {
    return (
      <div className="space-y-3">
        <p className="text-[0.85rem] text-muted">
          {booking.status === "CONFIRMED" ? "No actions available." : "This reservation is closed. No further actions are available."}
        </p>
        {whatsappButton}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {waitingUntil ? (
        <p className="rounded-sm bg-gold/10 px-3 py-2 text-[0.82rem] text-ink-soft">
          {manual
            ? "Waiting for the client's WhatsApp message. When they confirm, tap Confirm reservation. Cancelled automatically at "
            : "Waiting for the client to confirm on WhatsApp. Cancelled automatically at "}
          <strong className="font-medium text-ink">{waitingUntil}</strong> without confirmation.
        </p>
      ) : (
        booking.status === "PENDING" && (
          <p className="rounded-sm bg-gold/10 px-3 py-2 text-[0.82rem] text-ink-soft">
            Waiting for the client&rsquo;s WhatsApp message. When they confirm, tap Confirm reservation. The time stays reserved until you
            confirm or cancel.
          </p>
        )
      )}

      {confirmingCancel ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-[0.9rem] text-red-800">
            {manual ? "Cancel this reservation? The time becomes free again." : "Cancel this reservation? The customer will be notified."}
          </p>
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
          {confirmable && (
            <Button size="sm" loading={pending && pendingAction === "confirm"} disabled={pending} onClick={() => run("confirm", () => confirmBookingAction(booking.id))}>
              Confirm reservation
            </Button>
          )}
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
          {whatsappButton}
        </div>
      )}

      {whatsappMode === "mock" && confirmable && !confirmingCancel && (
        <div className="rounded-sm border border-dashed border-sand p-3">
          <p className="text-[0.66rem] tracking-[0.2em] text-muted uppercase">Test mode · simulate the client&apos;s WhatsApp reply</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={pending && pendingAction === "client-confirm"}
              disabled={pending}
              onClick={() => run("client-confirm", () => simulateCustomerReplyAction(booking.id, "confirm"))}
            >
              Client taps Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={pending && pendingAction === "client-cancel"}
              disabled={pending}
              onClick={() => run("client-cancel", () => simulateCustomerReplyAction(booking.id, "cancel"))}
            >
              Client taps Cancel
            </Button>
          </div>
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
