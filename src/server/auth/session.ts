import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminArea } from "@/lib/admin-areas";
import { businessRule, unauthorized } from "@/server/errors";
import { canAccess, getAdminAccess, homeFor } from "./access";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, verifySessionToken, type AdminSession } from "./session-token";

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Every admin server action and /api/admin route calls this: the proxy alone is not trusted. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}

/** For admin pages: layouts and pages render in parallel, so each page checks the session itself. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** The salon owner. Staff accounts are not the main admin. */
export async function isMainAdmin(username: string): Promise<boolean> {
  return (await getAdminAccess(username)).owner;
}

/** Sends a staff admin away from a page they were not given. */
export async function requireArea(area: AdminArea): Promise<AdminSession> {
  const session = await requireAdminPage();
  const access = await getAdminAccess(session.username);
  if (!canAccess(access, area)) redirect(homeFor(access));
  return session;
}

/** Admins and Members & offers are only for the main admin. */
export async function requireOwnerPage(): Promise<AdminSession> {
  const session = await requireAdminPage();
  const access = await getAdminAccess(session.username);
  if (!access.owner) redirect(homeFor(access));
  return session;
}

export async function assertArea(area: AdminArea): Promise<void> {
  const session = await requireAdmin();
  const access = await getAdminAccess(session.username);
  if (!canAccess(access, area)) throw businessRule("INVALID_INPUT", "You do not have access to this.");
}

export async function startSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(username), {
    httpOnly: true,
    // COOKIE_SECURE=false is only for testing over plain http before the domain has HTTPS.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
