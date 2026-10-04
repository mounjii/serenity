import { jwtVerify, SignJWT } from "jose";
import { getAdminConfig } from "./config";

export const SESSION_COOKIE = "serenity_admin";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type AdminSession = { username: string; expiresAt: Date };

/** Changing the password hash invalidates every existing session. */
async function credentialsVersion(passwordHash: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(passwordHash));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(username: string): Promise<string> {
  const { sessionSecret, passwordHash } = getAdminConfig();
  return new SignJWT({ ver: await credentialsVersion(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret);
}

/** Returns the session for a valid, unexpired token issued for the current admin; null otherwise. */
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const { sessionSecret, passwordHash, username } = getAdminConfig();
  try {
    const { payload } = await jwtVerify(token, sessionSecret, { algorithms: ["HS256"] });
    if (payload.sub !== username || typeof payload.exp !== "number") return null;
    if (payload.ver !== (await credentialsVersion(passwordHash))) return null;
    return { username, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    return null;
  }
}
