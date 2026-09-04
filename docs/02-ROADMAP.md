# Roadmap

Legenda: ⚪ não iniciada · 🟡 em andamento · ✅ pronta

## Fase 0 · Fundação ✅ (2026-09-04)
Critério de pronto: CI verde, deploy na Vercel com login funcionando, RLS testada.
- [x] Pasta + repo + Next 16 + Tailwind + shadcn + Supabase SSR + Vitest + Playwright
- [x] Docs: PRD, roadmap, modelo de dados, decisões, questionário, modelo de negócio
- [x] `proxy.ts` + DAL de auth + login/cadastro + landing por papel
- [x] Migração 0001 (profiles, personals, alunos + RLS) + testes (unit, RLS, e2e)
- [x] Banco: schema `personal` no projeto compartilhado `instagram-isabel` (provisório, decisão #6); migração 0001 aplicada 04/09
- [x] Schema `personal` exposto na Data API; teste de RLS 10/10 contra o banco
- [x] Repo GitHub `andremacan-png/personal-app` + Vercel (produção pública em personal-app-ebon-two.vercel.app) + e2e 3/3 na produção

## Fase 1 · Piloto 🟡 (início 04/09, alvo: 2-3 semanas)
Critério de pronto: 3 alunos reais treinando 1 semana pelo app.
- [x] Cadastro de aluno + link de convite (WhatsApp) + aceite com criação de conta (04/09; RLS + e2e)
- [ ] Biblioteca: seed free-exercise-db traduzido + exercícios próprios do personal (com vídeo/gif)
- [ ] Programa: dias, exercícios, séries/reps/carga/descanso/observação; duplicar programa
- [ ] Aluno: treino de hoje, execução série a série, concluir, histórico
- [ ] Streak semanal + calendário de presença
- [ ] PWA: manifest + ícones + service worker (offline básico da tela de treino)
- [ ] Personal: visão "quem treinou esta semana"

## Fase 2 · Diferencial ⚪
- [ ] Limitações do aluno (cadastro + contraindicações por exercício)
- [ ] Adaptação por IA: sugere substituições dentro do permitido, personal aprova com 1 toque
- [ ] Evolução: gráfico de carga por exercício, recordes pessoais, medidas e fotos (bucket privado)
- [ ] Gamificação: XP por treino, badges, metas combinadas com o personal
- [ ] 2º personal usando (validação fora do amigo)

## Fase 3 · Dinheiro ⚪
- [ ] Mudar o banco para org Supabase própria (Pro) quando ~14 alunos pagarem a conta; exportar o schema `personal`
- [ ] Assinatura do app: R$ 10 × alunos cadastrados, cobrada do personal todo mês (cartão/Pix via Asaas), webhook
- [ ] Contagem de alunos cobráveis (status, data de corte) + fatura visível pro personal
- [ ] Opcional, a confirmar: personal cobra o próprio aluno pelo app (Asaas subconta, Pix/cartão)
- [ ] Termos de uso, política de privacidade, consentimento LGPD

## Fase 4 · Escala ⚪
- [ ] Lembretes push (PWA) e WhatsApp; aluno sumido
- [ ] Agenda do personal
- [ ] App nativo (Expo ou Capacitor) e publicação nas lojas
