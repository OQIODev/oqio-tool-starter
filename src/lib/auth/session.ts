import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Session vérifiée côté serveur. `null` si non connecté. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/**
 * Session vérifiée, ou lève une AuthError 401. À utiliser dans toute route API
 * et toute server action — le check du proxy est optimiste, pas une garantie.
 */
export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new AuthError("Non authentifié", 401);
  return user;
}
