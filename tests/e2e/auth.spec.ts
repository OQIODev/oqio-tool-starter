import { expect, test } from "@playwright/test";

/**
 * Le parcours d'authentification, dans un vrai navigateur.
 *
 * C'est le seul chemin que le starter garantit ; les tranches d'un outil
 * ajoutent leurs propres specs à côté. Ce qui est vérifié ici et nulle part
 * ailleurs : que les cookies de session traversent le proxy, que les
 * redirections aboutissent, et que la page protégée rend bien côté serveur.
 */

const PASSWORD = "e2e-mot-de-passe-1234";

/** Une adresse neuve par exécution : aucun test ne dépend d'un état laissé. */
function uniqueEmail(): string {
  return `e2e-${process.hrtime.bigint()}@oqio.test`;
}

test("une page protégée renvoie vers la connexion", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});

test("inscription, déconnexion, reconnexion", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/login");
  await page.getByRole("button", { name: "Pas de compte ? En créer un" }).click();
  await page.getByPlaceholder("Nom").fill("Testeur E2E");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Créer le compte" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("un mauvais mot de passe est refusé, sans laisser entrer", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/login");
  await page.getByRole("button", { name: "Pas de compte ? En créer un" }).click();
  await page.getByPlaceholder("Nom").fill("Testeur E2E");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Mot de passe/).fill("ce-n-est-pas-le-bon");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByText(/Échec|Invalid|incorrect/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
