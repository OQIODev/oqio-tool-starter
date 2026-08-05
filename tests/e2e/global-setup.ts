import { execSync } from "node:child_process";
import { testDatabaseUrl } from "../helpers/test-database";

/** Crée la base e2e si absente et y applique les migrations. Idempotent. */
export default function globalSetup(): void {
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl("e2e") },
  });
}
