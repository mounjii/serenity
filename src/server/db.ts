import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
