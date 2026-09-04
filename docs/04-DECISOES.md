# Decisões (ADR-lite) e aulas

Cada decisão: o que, por quê, o que perderíamos fazendo diferente. Escrito para quem não programa.

## 1. Multi-tenant e RLS desde o dia 1 (2026-09-04)
**O que**: toda tabela tem `personal_id`; o banco (Row Level Security) só devolve linhas do dono.
**Por quê**: é o que torna o app vendável para o 2º personal sem reescrever nada. Fazer "depois" custa
uma migração de todos os dados e uma auditoria de todas as telas. Na clínica o modelo é "quem logou vê
tudo", que serve para uma equipe só; aqui seria vazamento entre clientes.
**Aula**: segurança na tela é cortina; segurança no banco é parede. O Supabase falha em silêncio
quando falta policy de UPDATE/DELETE (0 linhas, sem erro), por isso testamos RLS automaticamente.

## 2. Testes desde o começo (2026-09-04)
**O que**: unitários (regras puras em `lib/`), RLS (banco) e e2e (login).
**Por quê**: "comercialmente estável" significa que uma mudança não quebra o que já vendemos.
Sem teste, cada feature nova é uma aposta. Com o 1º cliente pagando, não dá para apostar.
**Aula**: teste unitário prova a regra; teste de RLS prova a parede; e2e prova o caminho do usuário.

## 3. Migrações versionadas (2026-09-04)
**O que**: todo SQL de estrutura vira arquivo em `supabase/migrations/` e entra no git.
**Por quê**: banco de produção reconstruível, histórico de por que cada coluna existe, homologação
idêntica à produção. SQL solto no dashboard some da memória em uma semana.

## 4. CI bloqueia, deploy é automático (2026-09-04)
**O que**: GitHub Actions roda lint + tipos + testes em todo push; Vercel publica a `main`.
**Por quê**: o X vermelho aparece antes do cliente. Foi a lição da clínica em 01/09 (duas conversas
paralelas quebraram o build de produção).

## 5. PWA antes de app nativo (2026-09-04)
**O que**: web mobile-first instalável na tela inicial; nativo (Expo/Capacitor) na Fase 4.
**Por quê**: validar com o amigo em semanas, sem App Store, com a stack que o André já domina. Perdemos
push nativo e timer em tela bloqueada, ambos toleráveis no piloto. A lógica fica em `lib/` para ser
reaproveitada no nativo.

## 6. Contas separadas da clínica (2026-09-04)
**O que**: org Supabase, projeto Vercel e repo GitHub próprios.
**Por quê**: fatura, risco e propriedade separados. Se o app virar empresa ou ganhar sócio, transfere
limpo. Misturar com a clínica seria economizar 10 minutos hoje e pagar dias depois.
**Ajuste no mesmo dia (provisório)**: o plano grátis do Supabase limita a 2 projetos e ambos já estão em uso.
Até o app pagar a própria conta (~14 alunos × R$ 10 ≈ US$ 25/mês do Pro), as tabelas vivem no **schema
`personal` dentro do projeto `instagram-isabel`**, que não usa Auth para nada. O código já nasce apontando
para o schema (`lib/supabase/config.ts`); mudar de casa depois é exportar o schema e trocar 2 variáveis.
**Aula**: separar por schema é a segunda melhor forma de isolar; a primeira é projeto próprio. Registrar o
provisório com data e critério de saída evita que ele vire definitivo por esquecimento.

## 7. Next.js 16 com `proxy.ts` e DAL (2026-09-04)
**O que**: `proxy.ts` (novo nome do middleware) só renova sessão e redireciona; a checagem real de
permissão fica em `lib/auth/` (Data Access Layer), junto dos dados.
**Por quê**: é a recomendação da própria doc do Next 16 (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`).
O proxy roda em toda requisição, inclusive prefetch, então não pode consultar banco.

## 8. Quem paga é o personal, por aluno cadastrado (2026-09-04)
**O que**: receita do app = ~R$ 10 × alunos cadastrados na base do personal, cobrado mensalmente dele.
O aluno nunca paga o app.
**Por quê**: o personal já cobra o aluno; o app custa uma fração de uma mensalidade e cresce junto com
o negócio dele. Um cliente só (o personal) simplifica venda, suporte e contrato.
**Gateway**: Asaas (Pix nativo, sem exigir CNPJ). Tabelas nascem agnósticas (`gateway`, `gateway_ref`).
Cobrar o aluno pelo app é feature opcional para depois, não o modelo.

## 9. IA sugere, personal aprova (decidido, Fase 2)
**Por quê**: responsabilidade profissional é do personal; a IA acelera, não decide. Regras duras
(contraindicação vetada) ficam no banco; a IA só propõe dentro do permitido.

## 10. Contas nascem confirmadas pelo servidor, sem e-mail de confirmação (2026-09-04)
**O que**: cadastro do personal e aceite do convite do aluno criam a conta com uma chave de serviço no
servidor (`lib/auth/cadastro.ts`), já confirmada, e fazem o login em seguida.
**Por quê**: o projeto Supabase é compartilhado e o e-mail de confirmação apontaria para o site da esteira;
no piloto, o convite chega pelo WhatsApp do personal, que já é a prova de identidade que importa.
A chave de serviço nunca sai do servidor (`server-only`) e só faz isso.
**Aula**: "confirmar e-mail" protege contra cadastro com e-mail alheio. Aqui o risco é baixo (quem tem o
link é quem o personal convidou) e o ganho de conversão no celular é alto. Revisar quando houver domínio próprio.

## 11. Convite por link com token único e RPC no banco (2026-09-04)
**O que**: cada aluno nasce com `convite_token`; a página pública `/convite/[token]` só vê nomes
(`info_convite`, liberada para anônimo) e o aceite é uma função `aceitar_convite` que liga a conta ao
cadastro e invalida o token, tudo dentro do banco com regras de RLS testadas.
**Por quê**: a regra "só a primeira conta de aluno que abrir o link fica com ele" precisa ser atômica;
se ficasse no código da tela, duas aberturas quase simultâneas poderiam dar conflito.

## 12. Biblioteca de exercícios: base aberta traduzida por IA + curadoria do personal (2026-09-04)
**O que**: 876 exercícios do free-exercise-db (licença livre, imagens no GitHub) com nome e instruções traduzidos
pela API da Anthropic e contraindicações sugeridas por ela num vocabulário fixo. O personal duplica e edita o que
quiser; a base é só leitura.
**Por quê**: começar cheio no dia 1 vale mais que começar perfeito. Custou ~US$ 9 e um script retomável.
**Aula**: tudo que a IA gerou está marcado como sugestão e é revisável; nada dela entra em decisão sem um humano.

## 13. Adaptação em duas camadas: regras no banco, IA por cima (2026-09-04)
**O que**: o conflito exercício × limitação é uma regra determinística (`lib/limitacoes.ts`) que roda sempre e
nunca deixa passar um vetado; a IA só escolhe, entre os candidatos já filtrados, os 3 mais parecidos e explica.
**Por quê**: a regra dá segurança e custo zero; a IA dá conveniência. Se a IA falhar ou não estiver configurada,
a tela continua útil (lista ordenada sem conflito).

## 14. Conquistas e streak derivados, sem tabela (2026-09-04)
**O que**: sequência semanal e medalhas são calculadas na hora a partir das execuções.
**Por quê**: zero risco de dessincronizar; regra pura testada. Se um dia precisar de notificação "você ganhou",
aí sim materializa em tabela de eventos.

## 15. Três armadilhas do Next 16 encontradas hoje
`body` em `flex flex-col` deixa o `main` mais largo que a tela no mobile (min-width automático do item flex) ·
`<Link>` pré-carrega a rota: nunca colocar efeito caro (IA) atrás de um GET com Link, usar ação de formulário ·
`describe.skip` do Vitest executa o corpo do describe (criar clientes só dentro de `beforeAll`).

