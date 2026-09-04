@AGENTS.md

# APP Personal — regras do projeto

App **personal trainer ↔ aluno**, SaaS multi-tenant (o personal paga por aluno cadastrado).
Codinome "APP Personal" (pacote `personal-app`). Dono: André. Product owner de domínio: o amigo personal.

## Dois objetivos, sempre juntos
1. **Produto comercialmente estável, vendável e escalável** (não "funciona pra mim").
2. **Aprendizado do André**: toda decisão técnica relevante ganha uma nota curta em `docs/04-DECISOES.md`
   explicando o porquê em linguagem de leigo. Sem jargão gratuito.

## Processo (não negociável)
- **PRD antes de código de domínio**: se a feature não está em `docs/01-PRD.md`, escreva lá primeiro.
- **Multi-tenant + RLS desde o dia 1**: toda tabela tem dono (personal) e policy. UPDATE/DELETE sem policy
  falha em SILÊNCIO no Supabase (0 linhas, `error: null`), por isso **toda tabela nova ganha teste de RLS**.
- **Migrações versionadas** em `supabase/migrations/` (nunca SQL solto no dashboard).
- **Testes**: unitários (Vitest, `tests/`), RLS/integração (`tests/rls/`), e2e (Playwright, `e2e/`).
  `npm run lint && npm run typecheck && npm test` verdes antes de qualquer push.
- **CI** (GitHub Actions) bloqueia; deploy = Vercel (preview por PR, produção na `main`).
- **Git**: nunca `git add -A`; add por caminho. Commit em português, prefixo `feat|fix|docs|chore(escopo):`.
- **Escrita**: nunca travessão (— / –) em texto que o usuário final vê.

## Stack
Next.js 16 (App Router, `proxy.ts` no lugar de middleware) · React 19 · TypeScript · Tailwind 4 · shadcn ·
Supabase (Auth + Postgres + RLS, `@supabase/ssr`) · Vitest · Playwright · Vercel · PWA.
Ler `node_modules/next/dist/docs/` antes de usar API do Next que não conhece.

## Diário de bordo (atualizar SEM ser lembrado)
- Marco relevante (feature, migração, decisão) ⇒ entrada datada em `DIARIO.md` (o que · arquivos · pendências).
- "fecha o dia" / "atualiza o diário" ⇒ consolidar `DIARIO.md` + memória e devolver um parágrafo de retomada.
- Início de conversa: ler memória + `DIARIO.md` + `docs/02-ROADMAP.md` e continuar de onde parou.

## Mapa
`docs/` = produto e decisões · `app/` = rotas · `lib/` = domínio puro (testável) e acesso a dados (DAL) ·
`components/` = UI · `supabase/migrations/` = banco · `tests/` + `e2e/` = provas.
