import dotenv from "dotenv";

/**
 * URL d'une base dédiée aux tests, dérivée de `DATABASE_URL`.
 *
 * Jamais la base du dev : les suites vident les tables, et effacer les données
 * qu'on vient de saisir à la main en pleine vérification est un piège qui ne se
 * voit qu'une fois qu'il a mordu. `app` → `app_test`, `app_e2e`, etc.
 *
 * `dotenv` n'écrase pas une variable déjà posée, donc un `DATABASE_URL` fourni
 * par le shell reste prioritaire sur les fichiers .env.
 */
export function testDatabaseUrl(suffix: string): string {
  dotenv.config({ path: ".env.local", quiet: true });
  dotenv.config({ path: ".env", quiet: true });

  const devUrl = process.env.DATABASE_URL;
  if (!devUrl) {
    throw new Error("DATABASE_URL manquant — les tests ont besoin de Postgres.");
  }

  const url = new URL(devUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}_${suffix}`;
  return url.toString();
}
