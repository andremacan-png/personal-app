# Diário de bordo — APP Personal

Projeto tocado em conversas do Claude Code. Cada conversa lê este arquivo + memória e continua.

## Frentes
| Frente | Estado | Onde |
|---|---|---|
| Fundação (repo, docs, auth, CI, deploy) | 🟡 em andamento | `docs/02-ROADMAP.md` Fase 0 |
| Piloto (treino + execução + streak) | ⚪ não iniciada | Fase 1 |
| Diferencial (evolução, gamificação, IA) | ⚪ | Fase 2 |
| Dinheiro (Asaas) | ⚪ | Fase 3 |
| Escala (lembretes, nativo) | ⚪ | Fase 4 |

## Pendências abertas
- [ ] André: expor o schema `personal` na Data API do projeto `instagram-isabel` (Integrations → Data API → Settings → Exposed schemas)
- [ ] Vercel: projeto `personal-app` ligado ao repo + variáveis cadastradas; **falta o push do André** para o 1º deploy (URL sai depois)
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
