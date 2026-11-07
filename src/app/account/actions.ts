"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearCustomerAvatar, saveCustomerAvatar } from "@/server/avatar";
import { changeCustomerPassword, loginCustomer, MIN_CUSTOMER_PASSWORD, registerCustomer } from "@/server/customer/auth";
import { confirmPasswordReset, requestPasswordReset, type ResetChannel } from "@/server/customer/password-reset";
import { saveCustomerPreferences } from "@/server/customer/preferences";
import { markLoyaltyAlertsRead, redeemPoints, saveBirthday } from "@/server/loyalty/engine";
import { endCustomerSession, getCustomerSession, startCustomerSession } from "@/server/customer/session";
import { AppError } from "@/server/errors";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";

export type CustomerAuthState = { error: string | null; fieldErrors?: Record<string, string>; saved?: boolean };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/account";
  if (next.startsWith("/account/login") || next.startsWith("/account/register") || next.startsWith("/account/preferences")) return "/account";
  if (next.startsWith("/account") || next.startsWith("/reservation")) return next;
  return "/account";
}

async function clientKey(): Promise<string> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  return `customer:${ip}`;
}

function translateFields(fields: Record<string, string> | undefined, t: Awaited<ReturnType<typeof getI18n>>["t"]): Record<string, string> | undefined {
  if (!fields) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key === "phone" && value === "taken") out[key] = t.account.phoneTaken;
    else if (key === "phone") out[key] = t.fields.phoneInvalid;
    else if (key === "name") out[key] = t.fields.nameRequired;
    else if (key === "currentPassword") out[key] = t.account.currentPasswordRequired;
    else if (key === "password") out[key] = fmt(t.account.passwordShort, { n: MIN_CUSTOMER_PASSWORD });
    else if (key === "confirmPassword") out[key] = t.account.passwordMismatch;
    else if (key === "email" && value === "taken") out[key] = t.account.emailTaken;
    else if (key === "email") out[key] = t.account.emailInvalid;
    else if (key === "birthday") out[key] = t.account.dateInvalid;
    else if (key === "preferredMassage" || key === "wellnessGoal" || key === "visitFrequency" || key === "discovery") out[key] = t.account.chooseOne;
    else out[key] = value;
  }
  return out;
}

export async function customerLoginAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const { t } = await getI18n();
  let result: Awaited<ReturnType<typeof loginCustomer>>;
  try {
    result = await loginCustomer(
      {
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? "").slice(0, 200),
      },
      await clientKey(),
    );
  } catch (error) {
    console.error("[auth] customer login failed", error);
    return { error: t.account.unavailable };
  }
  if (result === "throttled") return { error: t.account.throttled };
  if (result === "invalid") return { error: t.account.invalidCredentials };
  await startCustomerSession(result.id, result.passwordHash, formData.get("remember") === "1");
  redirect(safeNext(formData.get("next")));
}

export async function customerRegisterAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const { t, href } = await getI18n();
  try {
    const customer = await registerCustomer({
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? "").slice(0, 120),
      birthday: String(formData.get("birthday") ?? "").slice(0, 10),
      password: String(formData.get("password") ?? "").slice(0, 200),
      confirmPassword: String(formData.get("confirmPassword") ?? "").slice(0, 200),
    });
    await startCustomerSession(customer.id, customer.passwordHash);
    const next = safeNext(formData.get("next"));
    redirect(href(`/account/preferences?next=${encodeURIComponent(next)}`));
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.fields?.phone === "taken" ? t.account.phoneTaken : t.account.checkFields, fieldErrors: translateFields(error.fields, t) };
    }
    throw error;
  }
}

export async function savePreferencesAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const session = await getCustomerSession();
  const { t, href } = await getI18n();
  if (!session) redirect("/account/login");
  try {
    await saveCustomerPreferences(session.id, {
      preferredMassage: String(formData.get("preferredMassage") ?? "").slice(0, 80),
      wellnessGoal: String(formData.get("wellnessGoal") ?? "").slice(0, 20),
      visitFrequency: String(formData.get("visitFrequency") ?? "").slice(0, 20),
      discovery: String(formData.get("discovery") ?? "").slice(0, 20),
    });
  } catch (error) {
    if (error instanceof AppError) return { error: t.account.checkFields, fieldErrors: translateFields(error.fields, t) };
    throw error;
  }
  revalidatePath("/account");
  revalidatePath("/account/info");
  redirect(href(safeNext(formData.get("next"))));
}

export async function customerLogoutAction(): Promise<void> {
  await endCustomerSession();
  redirect("/");
}

export type LoyaltyFormState = { error: string | null; saved?: boolean };

export async function redeemPointsAction(points: number): Promise<LoyaltyFormState> {
  const session = await getCustomerSession();
  const { t } = await getI18n();
  if (!session) redirect("/account/login");
  try {
    await redeemPoints(session.id, points);
    revalidatePath("/account");
    revalidatePath("/account/loyalty");
    return { error: null, saved: true };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    return { error: t.errors.generic };
  }
}

export async function changePasswordAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const session = await getCustomerSession();
  const { t } = await getI18n();
  if (!session) redirect("/account/login");
  try {
    const passwordHash = await changeCustomerPassword(session.id, {
      currentPassword: String(formData.get("currentPassword") ?? "").slice(0, 200),
      password: String(formData.get("password") ?? "").slice(0, 200),
      confirmPassword: String(formData.get("confirmPassword") ?? "").slice(0, 200),
    });
    await startCustomerSession(session.id, passwordHash);
    return { error: null, saved: true };
  } catch (error) {
    if (error instanceof AppError) {
      if (error.fields?.currentPassword === "invalid") return { error: t.account.wrongPassword, fieldErrors: { currentPassword: t.account.wrongPassword } };
      return { error: t.account.checkFields, fieldErrors: translateFields(error.fields, t) };
    }
    throw error;
  }
}

export async function saveBirthdayAction(_prev: LoyaltyFormState, formData: FormData): Promise<LoyaltyFormState> {
  const session = await getCustomerSession();
  const { t } = await getI18n();
  if (!session) redirect("/account/login");
  try {
    const raw = String(formData.get("birthday") ?? "").trim();
    await saveBirthday(session.id, raw || null);
    revalidatePath("/account");
    revalidatePath("/account/info");
    return { error: null, saved: true };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    return { error: t.errors.generic };
  }
}

export async function saveAvatarAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const session = await getCustomerSession();
  const { t } = await getI18n();
  if (!session) redirect("/account/login");
  try {
    if (formData.get("remove") === "1") await clearCustomerAvatar(session.id);
    else await saveCustomerAvatar(session.id, formData.get("avatar"));
    revalidatePath("/account");
    revalidatePath("/account/info");
    return { error: null, saved: true };
  } catch (error) {
    if (error instanceof AppError) return { error: t.account.photoInvalid };
    return { error: t.errors.generic };
  }
}

export type PasswordResetState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  step: "ask" | "code";
  channel: ResetChannel;
  destination: string;
  devCode?: string;
};

function resetChannel(value: FormDataEntryValue | null): ResetChannel {
  return value === "email" ? "email" : "phone";
}

export async function passwordResetAction(_prev: PasswordResetState, formData: FormData): Promise<PasswordResetState> {
  const { t, href } = await getI18n();
  const channel = resetChannel(formData.get("channel"));
  const destination = String(formData.get(channel === "email" ? "email" : "phone") ?? "").slice(0, 120);
  const base = { step: "ask" as const, channel, destination, error: null };
  const key = `reset:${await clientKey()}`;

  if (formData.get("intent") !== "confirm") {
    const result = await requestPasswordReset({
      channel,
      destination,
      message: t.account.forgotCodeMessage,
      throttleKey: key,
    });
    if (result.status === "invalid") {
      return { ...base, error: null, fieldErrors: { [channel]: channel === "email" ? t.account.emailInvalid : t.fields.phoneInvalid } };
    }
    if (result.status === "throttled") return { ...base, error: t.account.throttled };
    if (result.status === "unavailable") return { ...base, error: t.account.forgotUnavailable };
    return { error: null, step: "code", channel, destination, devCode: result.devCode };
  }

  const result = await confirmPasswordReset({
    channel,
    destination,
    code: String(formData.get("code") ?? "").slice(0, 12),
    password: String(formData.get("password") ?? "").slice(0, 200),
    confirmPassword: String(formData.get("confirmPassword") ?? "").slice(0, 200),
    throttleKey: key,
  });
  const again = { error: null, step: "code" as const, channel, destination };
  if (result.status === "throttled") return { ...again, error: t.account.throttled };
  if (result.status === "invalid-password") {
    const message = result.field === "confirmPassword" ? t.account.passwordMismatch : fmt(t.account.passwordShort, { n: MIN_CUSTOMER_PASSWORD });
    return { ...again, fieldErrors: { [result.field]: message } };
  }
  if (result.status !== "ok") return { ...again, error: t.account.forgotCodeInvalid };
  redirect(href("/account/login?reset=1"));
}

export async function markAlertsReadAction(): Promise<void> {
  const session = await getCustomerSession();
  if (!session) return;
  await markLoyaltyAlertsRead(session.id);
  revalidatePath("/account");
  revalidatePath("/account/loyalty");
}
