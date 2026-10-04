const MIN_SECRET_LENGTH = 32;

export type AdminConfig = { username: string; passwordHash: string; sessionSecret: Uint8Array };

/** Reads and validates the admin variables. Throws a clear error when the server is misconfigured. */
export function getAdminConfig(): AdminConfig {
  const username = process.env.ADMIN_USERNAME?.trim();
  // Next.js expands "$" in .env files, so the bcrypt hash is written there with "\$"; hosting panels pass it raw.
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim().replace(/\\\$/g, "$");
  const secret = process.env.SESSION_SECRET ?? "";

  if (!username) throw new Error("ADMIN_USERNAME is not set.");
  if (!passwordHash || !/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash)) {
    throw new Error("ADMIN_PASSWORD_HASH is missing or is not a bcrypt hash (generate one with `npm run hash-password`).");
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }
  return { username, passwordHash, sessionSecret: new TextEncoder().encode(secret) };
}
