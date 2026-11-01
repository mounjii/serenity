import { getDb } from "@/server/db";

const MIN_SECRET_LENGTH = 32;
const HASH_RE = /^\$2[aby]\$\d{2}\$.{53}$/;

export type AdminConfig = { username: string; passwordHash: string; sessionSecret: Uint8Array };

const globalForAdmin = globalThis as unknown as { adminConfig?: AdminConfig };

function sessionSecretFromEnv(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }
  return new TextEncoder().encode(secret);
}

function envCredentials(): { username: string; passwordHash: string } {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim().replace(/\\\$/g, "$");
  if (!username) throw new Error("ADMIN_USERNAME is not set.");
  if (!passwordHash || !HASH_RE.test(passwordHash)) {
    throw new Error("ADMIN_PASSWORD_HASH is missing or is not a bcrypt hash (generate one with `npm run hash-password`).");
  }
  return { username, passwordHash };
}

export function clearAdminConfigCache() {
  globalForAdmin.adminConfig = undefined;
}

/** Reads the dashboard-saved account when present, otherwise the ADMIN_* environment variables. */
export async function getAdminConfig(): Promise<AdminConfig> {
  if (globalForAdmin.adminConfig) return globalForAdmin.adminConfig;

  const sessionSecret = sessionSecretFromEnv();
  try {
    const row = await getDb().adminAccount.findUnique({ where: { id: 1 } });
    if (row?.username.trim() && HASH_RE.test(row.passwordHash)) {
      const config = { username: row.username.trim(), passwordHash: row.passwordHash, sessionSecret };
      globalForAdmin.adminConfig = config;
      return config;
    }
  } catch {
    // Table missing before migrate, or DB unreachable: fall back to env.
  }

  const config = { ...envCredentials(), sessionSecret };
  globalForAdmin.adminConfig = config;
  return config;
}
