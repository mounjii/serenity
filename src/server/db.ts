import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { LoyaltyAlertKind, Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaFields?: string };

function customerFields(): string {
  return [
    Object.keys(Prisma.CustomerScalarFieldEnum).join(","),
    Object.keys(Prisma.AdminAccountScalarFieldEnum).join(","),
    Object.keys(LoyaltyAlertKind).join(","),
  ].join("|");
}

function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set.");
  }
  const url = new URL(raw);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5),
    // MySQL 8 users created with caching_sha2_password need this on non-TLS connections.
    allowPublicKeyRetrieval: true,
  });
  return new PrismaClient({ adapter });
}

/** Lazily created so that importing this module never needs a database (e.g. during `next build`). */
export function getDb(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const fields = customerFields();
  // The dev server keeps one client for the whole process. After `prisma generate`, that copy is missing new columns.
  if (cached && (globalForPrisma.prismaFields !== fields || !cached.customer || !cached.voucher || !cached.passwordReset)) {
    globalForPrisma.prisma = undefined;
    void cached.$disconnect().catch(() => undefined);
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaFields = fields;
  }
  return globalForPrisma.prisma;
}
