import { expect, test } from "@playwright/test";

test("visitante é levado ao login", async ({ page }) => {
  await page.goto("/personal");
  await expect(page).toHaveURL(/\/login\?proximo=%2Fpersonal/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("senha errada mostra erro", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ninguem@teste.local");
  await page.getByLabel("Senha").fill("senha-errada-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert")).toContainText("incorretos");
});

test("personal entra e cai no painel", async ({ page }) => {
  const email = process.env.E2E_PERSONAL_EMAIL;
  const senha = process.env.E2E_PERSONAL_SENHA;
  test.skip(!email || !senha, "precisa de E2E_PERSONAL_EMAIL/SENHA (seed do homolog)");
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/personal$/);
  await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible();
});
