import { expect, test } from "@playwright/test";

const email = process.env.E2E_PERSONAL_EMAIL, senha = process.env.E2E_PERSONAL_SENHA;

test("personal cadastra aluno, aluno aceita convite e cai no app", async ({ page, browser }) => {
  test.skip(!email || !senha, "precisa do personal de teste (npm run seed:e2e)");
  const sufixo = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // 1. personal entra e cadastra o aluno
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/personal$/);
  await page.goto("/personal/alunos/novo");
  await page.getByLabel("Nome").fill(`Carla E2E ${sufixo}`);
  await page.getByLabel(/WhatsApp/).fill("48 99999-1234");
  await page.getByRole("button", { name: /Cadastrar/ }).click();
  await expect(page).toHaveURL(/\/personal\/alunos\?novo=/);
  const linha = page.locator("li", { hasText: `Carla E2E ${sufixo}` });
  await expect(linha).toContainText("Convite pendente");
  const wa = await linha.getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
  expect(wa).toContain("https://wa.me/5548999991234?text=");
  const link = decodeURIComponent(wa!.split("text=")[1]).match(/https?:\/\/\S+\/convite\/[0-9a-f-]{36}/)![0];

  // 2. aluno abre o convite em outro navegador (sem sessão) e cria a conta
  const ctx = await browser.newContext();
  const aluno = await ctx.newPage();
  await aluno.goto(link);
  await expect(aluno.getByRole("heading", { name: /Oi, Carla/ })).toBeVisible();
  await aluno.getByLabel("E-mail").fill(`e2e-aluno-${sufixo}@teste.local`);
  await aluno.getByLabel("Senha").fill("senha-aluno-12345");
  await aluno.getByRole("button", { name: /Criar conta e entrar/ }).click();
  await expect(aluno).toHaveURL(/\/aluno$/);
  await expect(aluno.getByText(/ainda não montou seu programa/)).toBeVisible();

  // 3. convite não vale mais; personal vê o aluno ativo
  await aluno.context().clearCookies();
  await aluno.goto(link);
  await expect(aluno.getByText(/já foi usado/)).toBeVisible();
  await ctx.close();
  await page.goto("/personal/alunos");
  await expect(page.locator("li", { hasText: `Carla E2E ${sufixo}` })).toContainText("Ativo");
});
