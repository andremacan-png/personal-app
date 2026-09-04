# APP Personal (codinome)

App para personal trainer e aluno. SaaS multi-tenant: o personal assina e paga por aluno cadastrado.

- Produto e decisões: `docs/`
- Rodar local: copie `.env.example` para `.env.local`, preencha com o projeto Supabase e `npm run dev`
- Provas: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`

## Ambiente local com chave de serviço
`.env.development.local` é um atalho (symlink) para `.env.test.local`, que tem a chave de serviço usada só no
servidor (cadastro sem e-mail de confirmação). Preview local: `npm run dev:test` (porta 3100).
