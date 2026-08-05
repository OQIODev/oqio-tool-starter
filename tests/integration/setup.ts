import { execSync } from "node:child_process";
import { testDatabaseUrl } from "../helpers/test-database";

// Bascule sur la base d'intégration avant que les tests n'importent Prisma.
process.env.DATABASE_URL = testDatabaseUrl("test");

// Idempotent : crée la base si absente, applique les migrations manquantes.
execSync("npx prisma migrate deploy", { stdio: "pipe", env: process.env });
