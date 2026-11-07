import { jwtVerify, SignJWT } from "jose";
import { getDb } from "@/server/db";
import { getAdminConfig } from "./config";

export const SESSION_COOKIE = "serenity_admin";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type AdminSession = { username: string; expiresAt: Date };

/** Changing the password hash invalidates every existing session. */
async function credentialsVersion(passwordHash: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(passwordHash));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function passwordHashFor(username: string): Promise<string | null> {
  const name = username.trim();
  if (!name) return null;
  try {
    const row = await getDb().adminAccount.findFirst({ where: { username: name }, select: { passwordHash: true } });
    if (row) return row.passwordHash;
  } catch {
    // Table missing before migrate: fall back to the env owner.
  }
  const config = await getAdminConfig();
  return config.username.toLowerCase() === name.toLowerCase() ? config.passwordHash : null;
}

export async function createSessionToken(username: string): Promise<string> {
  const { sessionSecret } = await getAdminConfig();
  const passwordHash = await passwordHashFor(username);
  if (!passwordHash) throw new Error("Unknown admin account.");
  return new SignJWT({ ver: await credentialsVersion(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username.trim())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret);
}

/** Returns the session for a valid, unexpired token issued for that admin's current password; null otherwise. */
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const { sessionSecret } = await getAdminConfig();
  try {
    const { payload } = await jwtVerify(token, sessionSecret, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    const passwordHash = await passwordHashFor(payload.sub);
    if (!passwordHash || payload.ver !== (await credentialsVersion(passwordHash))) return null;
    return { username: payload.sub, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    return null;
  }
}
