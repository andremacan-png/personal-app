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
- [ ] André: criar org + projeto Supabase separado da clínica e passar URL + chave publicável (ver `docs/04-DECISOES.md` #6)
- [ ] André: repo GitHub privado + projeto Vercel (o CLI `gh` não está instalado; Vercel CLI está)
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

