# Modelo de dados

Princípio: **toda linha tem dono**. O dono é o personal (`personal_id`). O aluno é um usuário que só
enxerga as linhas ligadas ao próprio `aluno_id`. Isso é garantido por RLS no banco, não só na tela.

## Identidade
| Tabela | Papel |
|---|---|
| `auth.users` | Supabase Auth (e-mail/senha, magic link) |
| `profiles` | 1:1 com `auth.users`. `papel`: `personal` \| `aluno`. Criada por trigger no signup |
| `personals` | o tenant. `profile_id` único, `nome`, `slug` |
| `alunos` | pertence a 1 personal. `profile_id` nulo até o aluno aceitar o convite; `convite_token`, `status` (`convidado`, `ativo`, `pausado`, `encerrado`) |

## Treino (Fase 1)
| Tabela | Campos-chave |
|---|---|
| `exercicios` | `personal_id` nulo = global (seed) · nome, grupo muscular, equipamento, instruções, mídia, `contraindicacoes[]` |
| `programas` | `personal_id`, `aluno_id`, nome, ativo, início/fim |
| `programa_dias` | `programa_id`, ordem, nome (A/B/C), observação |
| `programa_exercicios` | `programa_dia_id`, `exercicio_id`, ordem, séries, reps, carga sugerida, descanso, observação |
| `execucoes` | `aluno_id`, `programa_dia_id`, iniciado_em, concluído_em, RPE, observação |
| `execucao_series` | `execucao_id`, `programa_exercicio_id`, série, reps, carga |

## Evolução e gamificação (Fase 2)
`aluno_limitacoes` (região, descrição, desde) · `medidas` (data, peso, circunferências, fotos em bucket
privado) · `eventos_xp` (aluno, tipo, pontos, ref) · `conquistas` (catálogo) · `aluno_conquistas` ·
streak = view sobre `execucoes`.

## Dinheiro (Fase 3, tabelas já previstas, agnósticas de gateway)
`assinatura_app` (personal, status, gateway, `gateway_ref`) · `faturas_app` (personal, competência,
alunos cobráveis, valor unitário, total, status, `gateway_ref`). Opcional: `planos` / `assinaturas_aluno` /
`cobrancas` para o personal cobrar o aluno pelo app.

## RLS (regras)
- Funções auxiliares em SQL: `meu_papel()`, `meu_personal_id()`, `meu_aluno_id()`.
- Personal: `personal_id = meu_personal_id()` em SELECT/INSERT/UPDATE/DELETE.
- Aluno: SELECT nas próprias linhas; INSERT/UPDATE só em `execucoes`, `execucao_series`, `medidas`.
- Exercícios globais: SELECT para todo `authenticated`; escrita só por service role.
- **Cada tabela nova = teste em `tests/rls/`** que prova isolamento entre dois personais e entre dois alunos.
