import bcrypt from "bcryptjs";
import { getDb } from "@/server/db";
import { getAdminConfig } from "./config";

const DUMMY_HASH = "$2a$12$R9h/cIPz0gi.URNNXXkh.OG8i2fYcYxK8n5u0cG0k1m2n3o4p5q6r";

/** Always runs bcrypt, so a wrong username takes as long as a wrong password. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const name = username.trim();
  let hash = DUMMY_HASH;
  let known = false;
  try {
    const row = name ? await getDb().adminAccount.findFirst({ where: { username: name }, select: { passwordHash: true } }) : null;
    if (row) {
      hash = row.passwordHash;
      known = true;
    }
  } catch {
    // Table missing before migrate: fall back to the env owner.
  }
  if (!known && name) {
    const config = await getAdminConfig();
    if (config.username.toLowerCase() === name.toLowerCase()) {
      hash = config.passwordHash;
      known = true;
    }
  }
  const passwordOk = await bcrypt.compare(password, hash);
  return known && passwordOk;
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
