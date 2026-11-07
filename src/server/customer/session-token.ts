import { jwtVerify, SignJWT } from "jose";
import { getDb } from "@/server/db";

export const CUSTOMER_SESSION_COOKIE = "serenity_customer";
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
/** Used when the customer leaves Remember me unchecked. */
export const CUSTOMER_SESSION_SHORT_SECONDS = 12 * 60 * 60;

export type CustomerSession = { id: string; name: string; phone: string; expiresAt: Date };

const MIN_SECRET_LENGTH = 32;

function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }
  return new TextEncoder().encode(secret);
}

/** Changing the password hash invalidates every existing session for that customer. */
async function credentialsVersion(passwordHash: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(passwordHash));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createCustomerSessionToken(
  id: string,
  passwordHash: string,
  maxAgeSeconds = CUSTOMER_SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT({ ver: await credentialsVersion(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(sessionSecret());
}

/** Returns the customer for a valid, unexpired token issued for the current password; null otherwise. */
export async function verifyCustomerSessionToken(token: string | undefined): Promise<CustomerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    const customer = await getDb().customer.findUnique({ where: { id: payload.sub } });
    if (!customer) return null;
    if (payload.ver !== (await credentialsVersion(customer.passwordHash))) return null;
    return { id: customer.id, name: customer.name, phone: customer.phone, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    return null;
  }
}
