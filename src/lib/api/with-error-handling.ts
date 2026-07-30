import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";
import { logError } from "@/lib/utils/logger";

type Handler<Args extends unknown[]> = (...args: Args) => Promise<Response>;

interface ErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Enveloppe une route API et sérialise les erreurs en JSON cohérent.
 * Les handlers de streaming (SSE) ne doivent PAS être enveloppés — ils gèrent
 * leur propre cycle de réponse.
 */
export function withErrorHandling<Args extends unknown[]>(
  routeName: string,
  handler: Handler<Args>,
): Handler<Args> {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json<ErrorBody>(
          { error: err.message, code: "auth" },
          { status: err.status },
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json<ErrorBody>(
          { error: "Validation échouée.", code: "validation", details: err.issues },
          { status: 400 },
        );
      }
      logError(`api.${routeName}.unhandled`, err);
      return NextResponse.json<ErrorBody>(
        { error: "Erreur serveur.", code: "internal" },
        { status: 500 },
      );
    }
  };
}
