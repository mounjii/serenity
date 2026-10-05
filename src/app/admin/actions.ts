"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminAction, type ActionResult } from "@/server/admin/action-result";
import { cancelBooking, completeBooking, confirmBooking, type AdminBooking } from "@/server/admin/bookings";
import { addClosedDay, removeClosedDay, type ClosedDayItem } from "@/server/admin/closed-days";
import { clearLoginFailures, isLoginThrottled, recordLoginFailure, verifyCredentials } from "@/server/auth/credentials";
import { endSession, startSession } from "@/server/auth/session";
import { applyCustomerReply } from "@/server/booking/confirmation";
import { createBooking } from "@/server/booking/create-booking";
import { businessRule } from "@/server/errors";
import {
  scheduleBookingCancelledNotification,
  scheduleBookingConfirmedNotification,
  scheduleBookingCreatedNotifications,
} from "@/server/notifications/booking-notifications";
import { isMockWhatsApp } from "@/server/whatsapp";

export type LoginState = { error: string | null };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return { error: "Invalid credentials" };
  }

  const requestHeaders = await headers();
  const clientKey = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  if (isLoginThrottled(clientKey)) return { error: "Too many attempts. Please try again in a few minutes." };

  let valid = false;
  try {
    valid = await verifyCredentials(username, password.slice(0, 200));
  } catch (error) {
    console.error("[auth] admin login is misconfigured", error);
    return { error: "Sign-in is temporarily unavailable." };
  }
  if (!valid) {
    recordLoginFailure(clientKey);
    return { error: "Invalid credentials" };
  }

  clearLoginFailures(clientKey);
  await startSession(username.trim());
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function cancelBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(async () => {
    const booking = await cancelBooking(id);
    scheduleBookingCancelledNotification(booking.id);
    return booking;
  });
}

export async function confirmBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(async () => {
    const booking = await confirmBooking(id);
    scheduleBookingConfirmedNotification(booking.id, "ADMIN");
    return booking;
  });
}

/** Test helper while WhatsApp runs in mock mode: acts as if the customer tapped Confirm or Cancel. */
export async function simulateCustomerReplyAction(id: string, action: "confirm" | "cancel"): Promise<ActionResult<{ outcome: string }>> {
  return adminAction(async () => {
    if (!isMockWhatsApp()) throw businessRule("CANNOT_CONFIRM", "Client replies can only be simulated in WhatsApp mock mode.");
    if (action !== "confirm" && action !== "cancel") throw businessRule("CANNOT_CONFIRM", "Unknown reply.");
    const outcome = await applyCustomerReply(id, action);
    if (outcome === "IGNORED") throw businessRule("CANNOT_CONFIRM", "This reservation is no longer waiting for the client.");
    return { outcome };
  });
}

export async function completeBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(() => completeBooking(id));
}

export type AdminBookingInput = {
  serviceId: string;
  durationMinutes: number;
  startAt: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  idempotencyKey: string;
};

export async function createAdminBookingAction(input: AdminBookingInput): Promise<ActionResult<{ id: string }>> {
  return adminAction(async () => {
    const { kind, booking } = await createBooking(
      {
        serviceId: input.serviceId,
        durationMinutes: input.durationMinutes,
        startAt: input.startAt,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        note: input.note,
        idempotencyKey: input.idempotencyKey,
      },
      { source: "ADMIN" },
    );
    if (kind === "created") scheduleBookingCreatedNotifications(booking.id);
    return { id: booking.id };
  });
}

export async function addClosedDayAction(input: { date: string; reason?: string }): Promise<ActionResult<ClosedDayItem>> {
  return adminAction(() => addClosedDay(input));
}

export async function removeClosedDayAction(id: string): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await removeClosedDay(id);
    return null;
  });
}
