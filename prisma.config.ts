import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load .env on its own. Node's built-in loader avoids a dotenv dependency;
// in production (Hostinger) the variables come from the hosting panel instead.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
