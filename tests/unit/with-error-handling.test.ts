import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { AuthError } from "@/lib/auth/session";

vi.mock("@/lib/utils/logger", () => ({
  logError: vi.fn(),
}));

describe("withErrorHandling", () => {
  it("laisse passer la réponse du handler", async () => {
    const route = withErrorHandling("test", async () => Response.json({ ok: true }));
    const res = await route();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("sérialise une AuthError avec son status", async () => {
    const route = withErrorHandling("test", async () => {
      throw new AuthError("Non authentifié", 401);
    });
    const res = await route();
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ code: "auth" });
  });

  it("sérialise une ZodError en 400", async () => {
    const route = withErrorHandling("test", async () => {
      z.object({ n: z.number() }).parse({ n: "pas un nombre" });
      return Response.json({});
    });
    const res = await route();
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ code: "validation" });
  });

  it("masque une erreur inattendue en 500", async () => {
    const route = withErrorHandling("test", async () => {
      throw new Error("détail interne à ne pas fuiter");
    });
    const res = await route();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toMatchObject({ code: "internal" });
    expect(JSON.stringify(body)).not.toContain("détail interne");
  });
});
