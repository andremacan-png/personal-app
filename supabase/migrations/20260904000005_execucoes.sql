-- APP Personal · 0005 · Execuções (treino realizado pelo aluno) e séries registradas
create table personal.execucoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references personal.alunos (id) on delete cascade,
  programa_dia_id uuid references personal.programa_dias (id) on delete set null,
  nome_dia text not null,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  duracao_seg int,
  rpe int check (rpe between 1 and 10),
  observacao text
);
create index execucoes_aluno_idx on personal.execucoes (aluno_id, concluido_em desc);

create table personal.execucao_series (
  id uuid primary key default gen_random_uuid(),
  execucao_id uuid not null references personal.execucoes (id) on delete cascade,
  programa_exercicio_id uuid references personal.programa_exercicios (id) on delete set null,
  exercicio_id uuid not null references personal.exercicios (id) on delete restrict,
  nome_exercicio text not null,
  ordem int not null default 1,
  serie int not null default 1,
  repeticoes int,
  carga numeric(6,2),
  concluida boolean not null default true
);
create index execucao_series_exec_idx on personal.execucao_series (execucao_id);
create index execucao_series_pe_idx on personal.execucao_series (programa_exercicio_id);

create or replace function personal.aluno_do_meu_tenant(p_aluno uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.alunos a where a.id = p_aluno and a.personal_id = personal.meu_personal_id());
$$;
create or replace function personal.execucao_e_minha(p_exec uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.execucoes e where e.id = p_exec and e.aluno_id = personal.meu_aluno_id());
$$;
create or replace function personal.execucao_do_meu_tenant(p_exec uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.execucoes e join personal.alunos a on a.id = e.aluno_id
                 where e.id = p_exec and a.personal_id = personal.meu_personal_id());
$$;
revoke all on function personal.aluno_do_meu_tenant(uuid), personal.execucao_e_minha(uuid), personal.execucao_do_meu_tenant(uuid) from public;
grant execute on function personal.aluno_do_meu_tenant(uuid), personal.execucao_e_minha(uuid), personal.execucao_do_meu_tenant(uuid) to authenticated, service_role;

grant select, insert, update, delete on personal.execucoes, personal.execucao_series to authenticated, service_role;
alter table personal.execucoes enable row level security;
alter table personal.execucao_series enable row level security;

create policy "execucoes: aluno tudo" on personal.execucoes for all to authenticated
  using (aluno_id = personal.meu_aluno_id()) with check (aluno_id = personal.meu_aluno_id());
create policy "execucoes: personal lê" on personal.execucoes for select to authenticated
  using (personal.aluno_do_meu_tenant(aluno_id));

create policy "series: aluno tudo" on personal.execucao_series for all to authenticated
  using (personal.execucao_e_minha(execucao_id)) with check (personal.execucao_e_minha(execucao_id));
create policy "series: personal lê" on personal.execucao_series for select to authenticated
  using (personal.execucao_do_meu_tenant(execucao_id));
