-- APP Personal · 0006 · Limitações do aluno (base da adaptação de treino)
create table personal.aluno_limitacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references personal.alunos (id) on delete cascade,
  regiao text not null,              -- vocabulário fixo em lib/limitacoes.ts (joelho, ombro, lombar, ...)
  descricao text,
  desde date,
  ativa boolean not null default true,
  criado_por text not null default 'personal',  -- 'personal' | 'aluno'
  criado_em timestamptz not null default now()
);
create index aluno_limitacoes_aluno_idx on personal.aluno_limitacoes (aluno_id) where ativa;

grant select, insert, update, delete on personal.aluno_limitacoes to authenticated, service_role;
alter table personal.aluno_limitacoes enable row level security;

create policy "limitacoes: personal tudo" on personal.aluno_limitacoes for all to authenticated
  using (personal.aluno_do_meu_tenant(aluno_id)) with check (personal.aluno_do_meu_tenant(aluno_id));
create policy "limitacoes: aluno lê as suas" on personal.aluno_limitacoes for select to authenticated
  using (aluno_id = personal.meu_aluno_id());
create policy "limitacoes: aluno informa" on personal.aluno_limitacoes for insert to authenticated
  with check (aluno_id = personal.meu_aluno_id() and criado_por = 'aluno');
create policy "limitacoes: aluno edita as que informou" on personal.aluno_limitacoes for update to authenticated
  using (aluno_id = personal.meu_aluno_id() and criado_por = 'aluno') with check (aluno_id = personal.meu_aluno_id() and criado_por = 'aluno');
