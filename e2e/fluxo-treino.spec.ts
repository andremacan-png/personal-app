import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_PERSONAL_EMAIL, senha = process.env.E2E_PERSONAL_SENHA;

async function entrar(page: Page, e: string, s: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(e);
  await page.getByLabel("Senha").fill(s);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("personal cria exercício e programa; aluno executa o treino e vê o histórico", async ({ page, browser }) => {
  test.skip(!email || !senha, "precisa do personal de teste (npm run seed:e2e)");
  test.setTimeout(120000);
  const sufixo = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // personal: exercício próprio
  await entrar(page, email!, senha!);
  await expect(page).toHaveURL(/\/personal$/);
  await page.goto("/personal/exercicios/novo");
  await page.getByLabel("Nome").fill(`Supino E2E ${sufixo}`);
  await page.getByLabel("Como executar", { exact: false }).fill("Deite no banco\nDesça a barra até o peito");
  await page.getByLabel(/Contraindicações/).fill("ombro");
  await page.getByRole("button", { name: "Criar exercício" }).click();
  await expect(page.getByRole("heading", { name: `Supino E2E ${sufixo}` })).toBeVisible();

  // personal: aluno + convite
  await page.goto("/personal/alunos/novo");
  await page.getByLabel("Nome").fill(`Carla E2E ${sufixo}`);
  await page.getByLabel(/WhatsApp/).fill("48 99999-1234");
  await page.getByRole("button", { name: /Cadastrar/ }).click();
  await page.locator("li", { hasText: `Carla E2E ${sufixo}` }).getByRole("link", { name: `Carla E2E ${sufixo}` }).click();
  await expect(page.getByRole("heading", { name: `Carla E2E ${sufixo}` })).toBeVisible();
  const alunoUrl = page.url();

  // personal: registra limitação de ombro → o editor deve avisar conflito
  await page.getByRole("combobox", { name: /Região/ }).selectOption("ombro");
  await page.getByPlaceholder("ex.: dor ao agachar fundo").fill("tendinite");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Ombro", { exact: true })).toBeVisible();

  // personal: programa com 2 dias e 1 exercício no dia A
  await page.getByLabel("Novo programa").fill("Hipertrofia E2E");
  await page.getByLabel("Dias").selectOption("2");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page).toHaveURL(/\/personal\/programas\//);
  await page.getByRole("link", { name: "+ Exercício" }).click();
  await page.getByPlaceholder("Buscar...").fill(`Supino E2E ${sufixo}`);
  await page.getByRole("button", { name: "Buscar" }).click();
  await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
  await expect(page.locator("li", { hasText: `Supino E2E ${sufixo}` })).toBeVisible();
  await page.locator("input[name=series]").first().fill("2");
  await page.locator("input[name=repeticoes]").first().fill("8");
  await page.locator("input[name=carga]").first().fill("30 kg");
  await page.locator("li form").filter({ has: page.locator("input[name=series]") }).first().getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("input[name=series]").first()).toHaveValue("2");
  await expect(page.getByText(/Cuidado com Ombro/)).toBeVisible();
  await expect(page.getByText(/1 exercício\(s\) com possível conflito/)).toBeVisible();

  // pega o token do convite pela página do aluno (link no WhatsApp)
  await page.goto(alunoUrl);
  const wa = await page.getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
  const linkConvite = decodeURIComponent(wa!.split("text=")[1]).match(/https?:\/\/\S+\/convite\/[0-9a-f-]{36}/)![0];

  // aluno: aceita convite e executa
  const ctx = await browser.newContext();
  const aluno = await ctx.newPage();
  await aluno.goto(linkConvite!);
  await aluno.getByLabel("E-mail").fill(`e2e-aluno-${sufixo}@teste.local`);
  await aluno.getByLabel("Senha").fill("senha-aluno-12345");
  await aluno.getByRole("button", { name: /Criar conta e entrar/ }).click();
  await expect(aluno).toHaveURL(/\/aluno$/);
  await expect(aluno.getByText("Hipertrofia E2E")).toBeVisible();
  await aluno.getByRole("link", { name: "Treinar" }).first().click();
  await expect(aluno.getByRole("heading", { name: "Treino A" })).toBeVisible();
  await expect(aluno.getByLabel("Carga série 1")).toHaveValue("30");
  await aluno.getByLabel("Marcar série 1").click();
  await aluno.getByLabel("Marcar série 2").click();
  await aluno.getByPlaceholder("7").fill("8");
  await aluno.getByRole("button", { name: "Concluir treino" }).click();
  await expect(aluno.getByRole("heading", { name: "Treino concluído!" })).toBeVisible();
  await aluno.goto("/aluno");
  await expect(aluno.getByText("1/2 treinos")).toBeVisible();
  await ctx.close();

  // personal vê o treino
  await page.goto(alunoUrl);
  await expect(page.getByText("Últimos treinos")).toBeVisible();
  await expect(page.locator("li", { hasText: "Treino A" }).first()).toContainText("hoje");
});
