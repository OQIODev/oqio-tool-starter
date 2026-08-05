import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";

/**
 * Vérifie que le schéma et la connexion tiennent contre un vrai Postgres — ce
 * qu'un mock ne prouve pas. Sert aussi de gabarit : les tranches d'un outil
 * ajoutent leurs propres suites ici.
 *
 * Prérequis : `docker compose up -d`.
 */

const EMAIL = "integration@oqio.test";

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

describe("les tables auth", () => {
  it("acceptent un utilisateur et le relisent", async () => {
    const created = await prisma.user.create({
      data: { id: "integration-user", name: "Testeur", email: EMAIL },
    });

    const found = await prisma.user.findUnique({ where: { email: EMAIL } });
    expect(found?.id).toBe(created.id);
    expect(found?.emailVerified).toBe(false);
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("refusent deux comptes sur la même adresse", async () => {
    await prisma.user.create({
      data: { id: "integration-user", name: "Testeur", email: EMAIL },
    });

    await expect(
      prisma.user.create({
        data: { id: "integration-doublon", name: "Doublon", email: EMAIL },
      }),
    ).rejects.toThrow();
  });

  it("suppriment les sessions avec leur utilisateur (cascade)", async () => {
    await prisma.user.create({
      data: {
        id: "integration-user",
        name: "Testeur",
        email: EMAIL,
        sessions: {
          create: {
            id: "integration-session",
            token: "jeton-de-test",
            expiresAt: new Date("2030-01-01T00:00:00Z"),
          },
        },
      },
    });

    await prisma.user.delete({ where: { id: "integration-user" } });
    expect(await prisma.session.count({ where: { id: "integration-session" } })).toBe(0);
  });
});
