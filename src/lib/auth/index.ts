import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";

/**
 * Instance Better Auth serveur. Seul point de vérité de l'authentification.
 * Les users vivent dans la DB Prisma — aucun couplage à un provider externe.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Cookie cache : évite un hit DB à chaque lecture de session.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
