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
- Pasta `~/Documents/Projeto - APP Personal/` criada como raiz do repo. Next 16.2.6 + Tailwind 4 + shadcn + Supabase SSR + Vitest + Playwright instalados.
- Docs escritos: PRD, roadmap, modelo de dados, decisões (aulas), questionário pro amigo, modelo de negócio.
- Esqueleto: `proxy.ts` (sessão), DAL em `lib/auth/`, login/cadastro por Supabase Auth, landing por papel (`/personal`, `/aluno`), 1ª migração (`profiles`, `personals`, `alunos` + RLS), testes unitário + RLS + e2e, CI, manifest PWA.
