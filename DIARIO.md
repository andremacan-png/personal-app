# Diário de bordo — APP Personal

Projeto tocado em conversas do Claude Code. Cada conversa lê este arquivo + memória e continua.

## Frentes
| Frente | Estado | Onde |
|---|---|---|
| Fundação (repo, docs, auth, CI, deploy) | ✅ concluída 04/09 | `docs/02-ROADMAP.md` Fase 0 |
| Piloto (treino + execução + streak) | 🟡 em andamento (1/7 itens) | Fase 1 |
| Diferencial (evolução, gamificação, IA) | ⚪ | Fase 2 |
| Dinheiro (Asaas) | ⚪ | Fase 3 |
| Escala (lembretes, nativo) | ⚪ | Fase 4 |

## Pendências abertas
- [ ] Fase 1: definir Site URL / Redirect URLs do Auth para o APP Personal (o projeto Supabase é compartilhado; hoje o e-mail de confirmação apontaria pro site da esteira) → fluxo de convite do aluno deve usar link próprio
- [ ] Vercel: `SUPABASE_SERVICE_ROLE_KEY` foi cadastrada pelo André mas o app não usa; remover ou manter só se algum job precisar
- [ ] Domínio próprio quando o nome estiver decidido (tira a produção da URL `.vercel.app`)
- [ ] Fase 3: migrar o banco para org Supabase própria (Pro) quando pagar a conta
- [ ] Amigo: responder `docs/05-QUESTIONARIO-AMIGO.md`
- [ ] Definir preço por aluno e faixa grátis (`docs/06-MODELO-NEGOCIO.md`)

## Histórico

### 2026-09-04 · Kick-off (Fase 0)
- 4 rodadas de perguntas com o André; decisões consolidadas em `docs/01-PRD.md` e `docs/04-DECISOES.md`.
- Pasta criada como raiz do repo (nasceu "Projeto - APP Personal", renomeada p/ `~/Documents/personal-app` no mesmo dia, sem espaços, padrão dos outros repos). Next 16.2.6 + Tailwind 4 + shadcn + Supabase SSR + Vitest + Playwright instalados.
- Docs escritos: PRD, roadmap, modelo de dados, decisões (aulas), questionário pro amigo, modelo de negócio.
- Correção do André no meio do caminho: **quem paga é o personal (~R$ 10 por aluno cadastrado)**, o aluno nunca paga; multi-tenant p/ muitos personais em paralelo. Docs ajustados (PRD, roadmap, modelo de dados, decisão #8, modelo de negócio).
- Esqueleto: `proxy.ts` (sessão), DAL em `lib/auth/`, login/cadastro por Supabase Auth, landing por papel (`/personal`, `/aluno`), 1ª migração (`profiles`, `personals`, `alunos` + RLS), testes unitário + RLS + e2e, CI, manifest PWA.
- Provas: lint ✅ · tsc ✅ · vitest 5/5 ✅ (RLS pulado sem banco) · `next build` ✅ · Playwright 2/2 ✅ (login seed pulado) · preview mobile OK.
- Como rodar o e2e com o preview aberto: `E2E_BASE_URL=http://localhost:3100 npx playwright test` (o Next 16 trava um 2º `next dev` na mesma pasta). Preview desta pasta está registrado no `launch.json` da clínica como `personal-app` (porta 3100) enquanto as conversas ainda abrem por lá.
- Lição: `describe.skip` do Vitest ainda executa o corpo do describe (criar clientes só no `beforeAll`); `CardTitle` do shadcn é `div`, não heading (pôr `h1` dentro); o Next injeta um `role="alert"` próprio (filtrar por texto no e2e).

### 2026-09-04 · Banco provisório no projeto compartilhado
- Supabase grátis = 2 projetos, ambos ocupados (clínica e esteira). Avaliadas alternativas (Pro US$ 25, Neon, Fly.io, self-host); decisão: **schema `personal` dentro do projeto `instagram-isabel`** até o app pagar a própria conta (decisão #6).
- Migração `personal_0001_fundacao` aplicada via conector com autorização do André: 3 tabelas, 8 policies, RLS on, gatilho `personal_ao_criar_usuario` em `auth.users` (só age se `metadata.papel` existir).
- Clientes e teste de RLS usam `db.schema = "personal"` (`lib/supabase/config.ts`).
- Repo no GitHub: `andremacan-png/personal-app` (push é do André; a trava não deixa eu enviar).
- Questionário do amigo também em PDF (`docs/`) e Google Doc.
- Schema exposto na Data API pelo André → **teste de RLS 10/10 contra o banco real** (personal X não vê Y; aluno só vê a si; UPDATE alheio = 0 linhas; auto-promoção = erro 42501). Banco limpo depois (afterAll apaga os usuários de teste).
- Lições: (1) insert em lote no supabase-js manda `null` nas colunas ausentes em alguma linha, o DEFAULT não se aplica; (2) quando USING acha a linha e WITH CHECK barra, o Postgres devolve erro, não 0 linhas; (3) `describe.skip` executa o corpo.
- Seed do personal de teste do e2e: `npm run seed:e2e` (lê `.env.test.local`).
- E2E 3/3 contra o preview (visitante → login; senha errada → erro; personal real → `/personal`). Vercel: projeto `personal-app` (time andre-macan-s-projects) linkado ao repo GitHub, env `NEXT_PUBLIC_SUPABASE_*` em production+preview. Deploy acontece no próximo push.

### 2026-09-04 · Produção no ar (fim da Fase 0)
- **URL pública: https://personal-app-ebon-two.vercel.app** (alias também em personal-app-andre-macan-s-projects.vercel.app). Deploy automático a cada push na `main`.
- Proteção da Vercel mudada (autorizada pelo André) de "todos os deploys" para **só previews**; produção aberta.
- 1º deploy deu 500: as variáveis `NEXT_PUBLIC_SUPABASE_*` estavam vazias no projeto. Recriadas via CLI (production + preview) e redeploy → **e2e 3/3 contra a produção** (visitante → login; senha errada; personal real → `/personal`).
- Lição: `vercel env pull` traz variáveis "sensitive" vazias, então o teste é sempre a URL respondendo; e `vercel redeploy` não aceita `--yes`.
- Fase 0 fechada. Próximo passo = Fase 1 (convite de aluno, biblioteca, programa, treino do dia), começando pelas respostas do questionário do amigo.

### 2026-09-04 · Fase 1 · incremento 1: alunos + convite ✅
- Migração `personal_0002_convite`: RPCs `info_convite` (anon vê só nomes) e `aceitar_convite` (atômica, só conta de aluno, token de uso único).
- Telas: `/personal/alunos` (lista, status, copiar link, botão WhatsApp `wa.me` com mensagem pronta), `/personal/alunos/novo`, `/convite/[token]` (cria conta + entra + aceita), `/personal` com contadores, `/aluno` mostra o personal.
- Decisões #10 (contas confirmadas pelo servidor, sem e-mail) e #11 (convite via RPC). Cadastro do personal também passou pelo servidor.
- Provas: vitest 20/20 (unit + RLS do convite contra o banco), **e2e 4/4** com o fluxo completo em 2 navegadores. `npm run seed:e2e` cria o personal de teste e limpa os alunos que o e2e gerou.
- Ambiente: `.env.development.local` → symlink para `.env.test.local` (chave de serviço no servidor local); preview em `npm run dev:test` (3100).
- Próximo incremento: biblioteca de exercícios (seed free-exercise-db traduzido + exercícios próprios).

