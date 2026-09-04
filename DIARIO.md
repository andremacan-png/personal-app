# Diário de bordo — APP Personal

Projeto tocado em conversas do Claude Code. Cada conversa lê este arquivo + memória e continua.

## Frentes
| Frente | Estado | Onde |
|---|---|---|
| Fundação (repo, docs, auth, CI, deploy) | ✅ concluída 04/09 | `docs/02-ROADMAP.md` Fase 0 |
| Piloto (treino + execução + streak) | ✅ funcional (falta só service worker offline) | Fase 1 |
| Diferencial (evolução, gamificação, IA) | 🟡 adiantada: limitações+IA ✅, evolução ✅, conquistas ✅ | Fase 2 |
| Dinheiro (Asaas) | ⚪ | Fase 3 |
| Escala (lembretes, nativo) | ⚪ | Fase 4 |

## Pendências abertas
- [ ] **Sessão de feedback com o amigo** no protótipo (produção). Roteiro: criar conta → cadastrar aluno → mandar convite → montar programa (copiar/IA) → aluno treina no celular → ver evolução
- [ ] Revisar com o amigo as contraindicações da base (sugestões de IA) nos 30 exercícios que ele mais usa
- [ ] Service worker (offline da tela de treino) e ícone/nome definitivos do PWA
- [ ] `seed:e2e` troca a senha do personal de teste e derruba a sessão dele (inofensivo, mas confunde ao testar no navegador)
- [ ] Fase 1: definir Site URL / Redirect URLs do Auth para o APP Personal (o projeto Supabase é compartilhado; hoje o e-mail de confirmação apontaria pro site da esteira) → fluxo de convite do aluno deve usar link próprio
- [ ] Domínio próprio quando o nome estiver decidido (tira a produção da URL `.vercel.app`)
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

### 2026-09-04 · Produção no ar (fim da Fase 0)
- **URL pública: https://personal-app-ebon-two.vercel.app** (alias também em personal-app-andre-macan-s-projects.vercel.app). Deploy automático a cada push na `main`.
- Proteção da Vercel mudada (autorizada pelo André) de "todos os deploys" para **só previews**; produção aberta.
- 1º deploy deu 500: as variáveis `NEXT_PUBLIC_SUPABASE_*` estavam vazias no projeto. Recriadas via CLI (production + preview) e redeploy → **e2e 3/3 contra a produção** (visitante → login; senha errada; personal real → `/personal`).
- Lição: `vercel env pull` traz variáveis "sensitive" vazias, então o teste é sempre a URL respondendo; e `vercel redeploy` não aceita `--yes`.
- Fase 0 fechada. Próximo passo = Fase 1 (convite de aluno, biblioteca, programa, treino do dia), começando pelas respostas do questionário do amigo.

### 2026-09-04 · Fase 1 · incremento 1: alunos + convite ✅
- Migração `personal_0002_convite`: RPCs `info_convite` (anon vê só nomes) e `aceitar_convite` (atômica, só conta de aluno, token de uso único).
- Telas: `/personal/alunos` (lista, status, copiar link, botão WhatsApp `wa.me` com mensagem pronta), `/personal/alunos/novo`, `/convite/[token]` (cria conta + entra + aceita), `/personal` com contadores, `/aluno` mostra o personal.
- Decisões #10 (contas confirmadas pelo servidor, sem e-mail) e #11 (convite via RPC). Cadastro do personal também passou pelo servidor.
- Provas: vitest 20/20 (unit + RLS do convite contra o banco), **e2e 4/4** com o fluxo completo em 2 navegadores. `npm run seed:e2e` cria o personal de teste e limpa os alunos que o e2e gerou.
- Ambiente: `.env.development.local` → symlink para `.env.test.local` (chave de serviço no servidor local); preview em `npm run dev:test` (3100).
- Próximo incremento: biblioteca de exercícios (seed free-exercise-db traduzido + exercícios próprios).
- Deploy do incremento em produção: a `SUPABASE_SERVICE_ROLE_KEY` da Vercel estava vazia → convite dava erro 500 no aceite. Recadastrada via CLI (production + preview, valor nunca exibido), redeploy → **e2e 4/4 na produção**. A chave de serviço agora é necessária no servidor (decisão #10).

### 2026-09-04 (noite) · Fase 1 · incrementos 2 a 5 em sessão autônoma
André saiu por 4h e pediu produção contínua. Entregue, tudo com RLS testada e commitado:
- **Biblioteca de exercícios** (migração 0003): 876 exercícios do free-exercise-db (licença livre, 2 imagens cada) com nome e instruções **traduzidos pela API da Anthropic** (`scripts/exercicios/traduzir.mjs`, claude-opus-5, ~US$ 7, retomável) + mapas determinísticos de músculo/equipamento/categoria; seed idempotente por slug (`scripts/exercicios/seed.mjs`). Personal cria os próprios (vídeo, imagem, contraindicações), duplica da base para editar, arquiva. Busca por nome, grupo e origem.
- **Programas** (0004): programa por aluno (1 ativo por vez, anteriores viram histórico) → dias → exercícios com séries/reps/carga/descanso/observação; reordenar, remover, duplicar programa, encerrar/reativar. Seletor de exercícios com busca.
- **Execuções** (0005): aluno vê o programa ativo com "sugestão de hoje" (dia menos recente), treina série a série com reps/carga pré-preenchidas da última vez, marca feitas, série extra, RPE e observação pro personal; **rascunho em localStorage** (refresh não perde); conclusão com resumo (séries, tempo, kg movidos); histórico.
- **Consistência**: `lib/streak.ts` (regra pura, 7 testes): meta semanal = nº de dias do programa, semanas seguidas (a semana em curso não quebra), calendário de 28 dias. Aluno vê na home; personal vê "quem treinou nos últimos 7 dias" (quem não treinou em vermelho) e, no aluno, semana/sequência/total + últimos treinos com observações 💬.
- Editar aluno (nome, WhatsApp, status pausado/encerrado).
- Provas: vitest **35 testes** (unit + RLS de 6 tabelas contra o banco), e2e **5 specs** incluindo o fluxo completo personal→aluno em 2 navegadores (16 s).
- Decisões implícitas a registrar: contas de aluno só via convite; um programa ativo por aluno; execução guarda snapshot do nome do dia/exercício (programa pode mudar depois).

### 2026-09-04 (noite) · Fase 2 adiantada: limitações, adaptação com IA, evolução
- Migração 0006 `aluno_limitacoes` (personal gerencia; aluno informa as próprias em "Meu corpo", RLS testada). Vocabulário fixo em `lib/limitacoes.ts` (joelho, ombro, lombar, quadril, cervical, punho, cotovelo, tornozelo, gestante, hipertensão, cardíaco, outro).
- Base de exercícios marcada com contraindicações pela API (`scripts/exercicios/contraindicacoes.mjs`, US$ 1,58): 784/876 com pelo menos 1 tag; ombro 390, lombar 350, gestante 190, joelho 177... **São sugestões**: o amigo deve revisar os que mais usa.
- Editor de programa avisa ⚠ por exercício em conflito e conta o total; "Ver alternativas" abre o seletor filtrado (mesmo grupo, sem conflito primeiro); "Trocar por este" herda séries/reps/descanso/observação e a posição. **Botão "Pedir 3 alternativas"** chama a Claude API (claude-opus-5) com o original, as limitações e os candidatos já filtrados pelas regras; devolve 3 com motivo em 1 frase. Funciona só onde há `ANTHROPIC_API_KEY`.
- Evolução: `evolucaoPorExercicio` + gráfico recharts (carga máx. ou volume por treino, recorde, delta). Aluno em "Evolução", personal em "ver evolução" no detalhe do aluno.
- Ajustes: overflow horizontal no mobile, último treino na lista de alunos, dica na home do aluno para informar limitações. E2E do fluxo completo agora cobre o conflito (limitação de ombro × exercício com contraindicação ombro).
- Provas: vitest 38, e2e 5 specs (fluxo completo ~17 s local). Tudo no ar via push.
- Também: **conquistas** derivadas dos dados (`lib/conquistas.ts`, sem tabela: 1º treino, 5/10/25/50/100 treinos, 2/4/8/12 semanas seguidas, semana cheia, recorde nos últimos 7 dias) na home do aluno; **copiar programa** de outro aluno como modelo (cargas não vêm junto); **landing pública** na raiz com CTA de cadastro; PWA: manifest e ícones servidos em produção (sem service worker ainda).
- Chaves: `ANTHROPIC_API_KEY` posta em production+preview na Vercel e no `.env.test.local` (via pipe, sem exibir). IA de alternativas funciona em produção.
- Lição: `<Link>` do Next pré-carrega a rota; um link para `?ia=1` disparava a chamada à IA só de aparecer na tela. Virou ação de formulário.

### 2026-09-04 (noite) · Fechamento da sessão autônoma
- Estado: **protótipo completo e navegável em produção** (https://personal-app-ebon-two.vercel.app). Personal: cadastro, alunos, convite WhatsApp, biblioteca (876 + próprios), programas (dias/exercícios/cópia), limitações, alertas de conflito, troca com regras + IA, quem treinou, evolução. Aluno: convite → conta, treino do dia com cargas anteriores e rascunho local, histórico, streak/calendário, conquistas, evolução, "Meu corpo". Landing pública.
- Provas finais: vitest 42 (unit + RLS de 7 tabelas contra o banco), e2e 5 specs verdes local e em produção (fluxo completo com IA). Banco limpo de dados de teste.
- Custos de IA da sessão: ~US$ 9,30 (tradução US$ 7,70 + contraindicações US$ 1,58); sugestões em tempo real custam centavos por pedido.
- Lições do dia (para `docs/04-DECISOES.md` quando houver tempo): body em flex-col alargava o main no mobile; Link do Next pré-carrega rotas (nunca colocar efeito caro atrás de um Link); `updateUserById(password)` derruba a sessão.

