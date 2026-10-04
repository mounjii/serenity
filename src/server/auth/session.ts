import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unauthorized } from "@/server/errors";
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

export async function startSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
