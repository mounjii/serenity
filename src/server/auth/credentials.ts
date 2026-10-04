import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { getAdminConfig } from "./config";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Always runs bcrypt, so a wrong username takes as long as a wrong password. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const config = getAdminConfig();
  const usernameOk = timingSafeEqual(sha256(username.trim()), sha256(config.username));
  const passwordOk = await bcrypt.compare(password, config.passwordHash);
  return usernameOk && passwordOk;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; resetAt: number }>();

/** Small in-memory brake against password guessing (per server process). */
export function isLoginThrottled(key: string, now = Date.now()): boolean {
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) return false;
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearLoginFailures(key: string): void {
  failures.delete(key);
}
