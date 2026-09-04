# PRD v1 — APP Personal

Data: 2026-09-04 · Dono: André · PO de domínio: o amigo personal (testa toda semana)

## 1. Problema
Personal trainers com 20 a 100 alunos (presencial + online) montam treino em papel, planilha ou WhatsApp.
O aluno se perde, o personal não sabe quem treinou, a adaptação a uma dor ou limitação leva tempo, e a
retenção cai porque o aluno não enxerga progresso. As ferramentas do mercado são caras por assento,
genéricas e não ajudam a adaptar o treino.

## 2. Proposta de valor
"Monte o treino em minutos, adapte em segundos às limitações do aluno, e mantenha o aluno engajado
com progresso visível." **Quem paga é o personal**, cerca de R$ 10 por aluno cadastrado na base dele
(o aluno nunca paga o app). O app é multi-tenant: muitos personais em paralelo, cada um com seus alunos,
sem enxergar os dados dos outros.

## 3. Personas
- **Personal (Rafael, 32)**: autônomo, presencial em academia + consultoria online. Planeja no desktop
  à noite, atualiza cargas na academia pelo celular. Quer parecer profissional e reter alunos.
- **Aluno (Carla, 41)**: treina 3x/semana, tem dor no ombro, usa só o celular. Quer saber o que fazer
  hoje, quanto colocou na barra da última vez e ver que está evoluindo.

## 4. Jornadas principais (MVP)
1. Personal cria conta → cadastra aluno (nome + WhatsApp) → app gera link de convite → aluno abre, cria
   senha e instala o app na tela inicial.
2. Personal monta programa (dias A/B/C) a partir da biblioteca de exercícios (base pronta + os dele).
3. Aluno abre "treino de hoje", executa, registra carga e reps por série, conclui. Streak sobe.
4. Personal vê quem treinou, ajusta cargas e observações no celular.

## 5. Escopo por fase (ver `02-ROADMAP.md` para critérios de pronto)
**Fase 1 · Piloto**: contas e convite, biblioteca de exercícios, programa por dia, treino do dia,
registro de execução, streak simples, PWA instalável.
**Fase 2 · Diferencial**: limitações do aluno + adaptação por IA (sugere, personal aprova), evolução
(gráficos, recordes pessoais, medidas), gamificação (XP, badges, metas).
**Fase 3 · Dinheiro**: assinatura do app cobrada do personal (R$ 10 × alunos cadastrados, mensal).
Opcional, a confirmar: o personal cobrar o próprio aluno pelo app (Asaas, Pix/cartão).
**Fase 4 · Escala**: lembretes (push/WhatsApp), aluno sumido, agenda, app nativo nas lojas.

## 6. Fora de escopo (por enquanto)
Marketplace de personais · ranking entre alunos · nutrição/dieta · integração com wearables ·
multi-profissional por studio (papel "dono") · idiomas além de PT-BR.

## 7. Requisitos não funcionais
- Mobile-first; funciona em rede ruim de academia (páginas leves, ações idempotentes).
- Multi-tenant com RLS: um personal nunca enxerga dados de outro; aluno só vê a si mesmo.
- LGPD: dados de saúde (limitações, medidas, fotos) são sensíveis. Consentimento explícito do aluno,
  exportação e exclusão sob pedido, fotos em bucket privado.
- Observabilidade mínima: erros de servidor logados; CI verde é pré-condição de deploy.

## 8. Métricas de sucesso do piloto
- 3 alunos reais treinando pelo app por 1 semana sem o personal precisar mandar treino por WhatsApp.
- ≥ 80% dos treinos previstos registrados no app.
- Personal monta um programa novo em < 10 minutos.

## 9. Riscos
- Prazo de 2-3 semanas × ambição (IA, pagamento): mitigado empurrando IA e Asaas para Fases 2 e 3.
- Biblioteca em inglês (free-exercise-db): tradução automática + revisão do amigo nos 100 mais usados.
- Dependência de um único personal como referência: validar com um 2º personal antes da Fase 3.
