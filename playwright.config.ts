import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/helpers/test-database";

/**
 * Port dédié aux e2e : un `npm run dev` déjà ouvert sur 3000 ne gêne pas, et on
 * ne teste jamais par accident un serveur dont on ignore l'état.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Crée et migre la base e2e. Ne dépend pas de l'ordre relatif avec
  // `webServer` : le serveur ne touche à la base qu'à la première requête d'un
  // test, et les tests ne démarrent qu'après le global setup.
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Le binaire local. Pas `npm run dev` : le script `dev` porte le port du
    // projet, et deux `--port` sur la même commande sont un piège. Pas `npx`
    // non plus : il interpose un `npm exec` entre le process rendu et le vrai
    // serveur — mesuré, tuer le premier laisse le second debout, et c'est comme
    // ça qu'un dev server e2e reste en vie après la passe.
    command: `./node_modules/.bin/next dev --port ${PORT}`,
    // `/login` ne touche pas la base : la sonde de démarrage n'a donc pas
    // besoin que les migrations soient déjà passées.
    url: `${BASE_URL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Base dédiée : les comptes créés par les tests ne polluent pas le dev.
      DATABASE_URL: testDatabaseUrl("e2e"),
      // Better Auth doit connaître l'origine réelle, sinon les cookies et les
      // redirections partent sur le port du dev.
      BETTER_AUTH_URL: BASE_URL,
    },
  },
});
