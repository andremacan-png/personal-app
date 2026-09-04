# Modelo de negócio (rascunho)

## Preço (decisão do André, 04/09)
**O personal paga ~R$ 10 por aluno cadastrado na base dele, por mês.** O aluno nunca paga o app.
Com 40 alunos: R$ 400/mês, ainda abaixo de 1 mensalidade típica de aluno.
A validar com o amigo e um 2º personal:
- O que conta como "cadastrado": só `ativo`, ou também `pausado`? (sugestão: ativo + pausado; encerrado não)
- Faixa grátis: até 3 alunos para experimentar sem cartão.
- Escala: muitos personais em paralelo, cada um com dezenas de alunos; custo marginal por tenant ≈ zero.

## Custos estimados (piloto)
| Item | Custo |
|---|---|
| Supabase | grátis até ~50k usuários/500MB; Pro US$ 25/mês quando precisar de backups e mais storage |
| Vercel | Hobby grátis (pessoal); Pro US$ 20/mês quando for comercial |
| Asaas | por transação (Pix ~R$ 1; cartão ~3-5%), sem mensalidade |
| Claude API (Fase 2) | centavos por sugestão de adaptação; estimar com uso real |
| Domínio | ~R$ 40/ano (.com.br) |

## Concorrência (para posicionar, checar depois)
MFIT Personal, Hexfit, Trainerize, TrueCoach. Diferencial nosso: adaptação a limitações com IA,
gamificação pensada para retenção e preço por aluno (não por assento fixo).

## Pendências
- [ ] Preço e faixa grátis (perguntas 16-18 do questionário)
- [ ] Nome/marca + domínio
- [ ] Termos de uso, privacidade e consentimento LGPD (Fase 3)
