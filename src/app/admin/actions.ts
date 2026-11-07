"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminAction, type ActionResult } from "@/server/admin/action-result";
import { cancelBooking, completeBooking, confirmBooking, type AdminBooking } from "@/server/admin/bookings";
import { addClosedDay, removeClosedDay, type ClosedDayItem } from "@/server/admin/closed-days";
import { addServicePrice, deleteServicePrice, setServiceBookable, setServicePriceActive, updateServicePrice } from "@/server/admin/prices";
import { createStaffAdmin, removeStaffAdmin, updateAdminProfile, updateStaffAccess } from "@/server/admin/profile";
import { clearAdminAvatar, saveAdminAvatar } from "@/server/avatar";
import { adminPathAllowed, getAdminAccess, homeFor } from "@/server/auth/access";
import { clearLoginFailures, isLoginThrottled, recordLoginFailure, verifyCredentials } from "@/server/auth/credentials";
import { assertArea, endSession, getSession, isMainAdmin, startSession } from "@/server/auth/session";
import { applyCustomerReply } from "@/server/booking/confirmation";
import { createBooking } from "@/server/booking/create-booking";
import { businessRule } from "@/server/errors";
import {
  scheduleBookingCancelledNotification,
  scheduleBookingConfirmedNotification,
  scheduleBookingCreatedNotifications,
} from "@/server/notifications/booking-notifications";
import { awardVisitPoints, sendPromo } from "@/server/loyalty/engine";
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
  const name = username.trim();
  await startSession(name);
  const access = await getAdminAccess(name);
  const next = safeNext(formData.get("next"));
  redirect(adminPathAllowed(access, next) ? next : homeFor(access));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export type ProfileState = { error: string | null; fieldErrors?: Record<string, string>; saved: boolean };

export async function updateAdminProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session) throw businessRule("INVALID_INPUT", "You must be signed in.");
    return updateAdminProfile(session.username, {
      username: String(formData.get("username") ?? ""),
      currentPassword: String(formData.get("currentPassword") ?? "").slice(0, 200),
      newPassword: String(formData.get("newPassword") ?? "").slice(0, 200),
      confirmPassword: String(formData.get("confirmPassword") ?? "").slice(0, 200),
    });
  });
  if (!result.ok) {
    return { error: result.error.message, fieldErrors: result.error.fields, saved: false };
  }
  await startSession(result.data.username);
  revalidatePath("/admin", "layout");
  return { error: null, saved: true };
}

export async function saveAdminAvatarAction(
  _prev: { error: string | null; saved?: boolean },
  formData: FormData,
): Promise<{ error: string | null; saved?: boolean }> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session) throw businessRule("INVALID_INPUT", "You must be signed in.");
    if (formData.get("remove") === "1") {
      await clearAdminAvatar(session.username);
      return;
    }
    await saveAdminAvatar(session.username, formData.get("avatar"));
  });
  if (!result.ok) return { error: result.error.message, saved: false };
  revalidatePath("/admin", "layout");
  return { error: null, saved: true };
}

export async function cancelBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(async () => {
    await assertArea("bookings");
    const booking = await cancelBooking(id);
    scheduleBookingCancelledNotification(booking.id);
    return booking;
  });
}

export async function confirmBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(async () => {
    await assertArea("bookings");
    const booking = await confirmBooking(id);
    scheduleBookingConfirmedNotification(booking.id, "ADMIN");
    return booking;
  });
}

/** Test helper while WhatsApp runs in mock mode: acts as if the customer tapped Confirm or Cancel. */
export async function simulateCustomerReplyAction(id: string, action: "confirm" | "cancel"): Promise<ActionResult<{ outcome: string }>> {
  return adminAction(async () => {
    await assertArea("bookings");
    if (!isMockWhatsApp()) throw businessRule("CANNOT_CONFIRM", "Client replies can only be simulated in WhatsApp mock mode.");
    if (action !== "confirm" && action !== "cancel") throw businessRule("CANNOT_CONFIRM", "Unknown reply.");
    const outcome = await applyCustomerReply(id, action);
    if (outcome === "IGNORED") throw businessRule("CANNOT_CONFIRM", "This reservation is no longer waiting for the client.");
    return { outcome };
  });
}

export async function completeBookingAction(id: string): Promise<ActionResult<AdminBooking>> {
  return adminAction(async () => {
    await assertArea("bookings");
    const booking = await completeBooking(id);
    await awardVisitPoints(booking.id);
    return booking;
  });
}

export async function createStaffAdminAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session) throw businessRule("INVALID_INPUT", "You must be signed in.");
    await createStaffAdmin(session.username, {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? "").slice(0, 200),
      confirmPassword: String(formData.get("confirmPassword") ?? "").slice(0, 200),
      areas: formData.getAll("areas").filter((value): value is string => typeof value === "string"),
    });
  });
  if (!result.ok) return { error: result.error.message, fieldErrors: result.error.fields, saved: false };
  revalidatePath("/admin/admins");
  return { error: null, saved: true };
}

export async function updateStaffAccessAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session) throw businessRule("INVALID_INPUT", "You must be signed in.");
    await updateStaffAccess(
      session.username,
      Number(formData.get("id")),
      formData.getAll("areas").filter((value): value is string => typeof value === "string"),
    );
  });
  if (!result.ok) return { error: result.error.message, fieldErrors: result.error.fields, saved: false };
  revalidatePath("/admin/admins");
  return { error: null, saved: true };
}

export async function removeStaffAdminAction(formData: FormData): Promise<void> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session) throw businessRule("INVALID_INPUT", "You must be signed in.");
    await removeStaffAdmin(session.username, Number(formData.get("id")));
  });
  if (!result.ok) return;
  revalidatePath("/admin/admins");
}

export async function sendLoyaltyPromoAction(formData: FormData): Promise<ActionResult<{ count: number }>> {
  const result = await adminAction(async () => {
    const session = await getSession();
    if (!session || !(await isMainAdmin(session.username))) throw businessRule("INVALID_INPUT", "Only the main admin can send offers.");
    const count = await sendPromo({
      message: String(formData.get("message") ?? ""),
      percent: Number(formData.get("percent") || 0) || undefined,
      days: Number(formData.get("days") || 0) || undefined,
    });
    return { count };
  });
  if (result.ok) {
    revalidatePath("/admin/loyalty");
    revalidatePath("/");
  }
  return result;
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
    await assertArea("bookings");
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
  return adminAction(async () => {
    await assertArea("closed");
    return addClosedDay(input);
  });
}

export async function addServicePriceAction(serviceId: string, durationMinutes: number, priceMad: number): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("prices");
    await addServicePrice(serviceId, durationMinutes, priceMad);
    return null;
  });
}

export async function updateServicePriceAction(optionId: string, priceMad: number): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("prices");
    await updateServicePrice(optionId, priceMad);
    return null;
  });
}

export async function deleteServicePriceAction(optionId: string): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("prices");
    await deleteServicePrice(optionId);
    return null;
  });
}

export async function setServicePriceActiveAction(optionId: string, active: boolean): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("prices");
    await setServicePriceActive(optionId, active);
    return null;
  });
}

export async function setServiceBookableAction(serviceId: string, active: boolean): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("prices");
    await setServiceBookable(serviceId, active);
    return null;
  });
}

export async function removeClosedDayAction(id: string): Promise<ActionResult<null>> {
  return adminAction(async () => {
    await assertArea("closed");
    await removeClosedDay(id);
    return null;
  });
}
