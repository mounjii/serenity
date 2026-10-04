/**
 * Usage:
 *   npm run hash-password -- "my new password"   hash the given password
 *   npm run hash-password                        generate a random password and hash it
 *
 * Paste the value in ADMIN_PASSWORD_HASH. In a local .env file every "$" must be written "\$"
 * (Next.js expands variables in .env files); in the Hostinger panel paste the raw hash.
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const MIN_LENGTH = 10;

async function main() {
  const given = process.argv[2];
  const password = given ?? randomBytes(12).toString("base64url");
  if (password.length < MIN_LENGTH) {
    console.error(`The password must be at least ${MIN_LENGTH} characters long.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  if (!given) console.log(`Generated password: ${password}`);
  console.log(`Hash (hosting panel):  ${hash}`);
  console.log(`Line for .env:         ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
