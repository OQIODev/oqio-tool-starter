import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/api/with-error-handling";

// Sonde pour Coolify / uptime. Vérifie que la DB répond, pas juste le process.
export const GET = withErrorHandling("health", async () => {
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true });
});
