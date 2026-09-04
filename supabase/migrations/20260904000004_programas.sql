-- APP Personal · 0004 · Programas de treino (programa → dias → exercícios)
create table personal.programas (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references personal.personals (id) on delete cascade,
  aluno_id uuid not null references personal.alunos (id) on delete cascade,
  nome text not null,
  observacao text,
  ativo boolean not null default true,
  inicio date not null default current_date,
  fim date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index programas_aluno_idx on personal.programas (aluno_id);
create index programas_personal_idx on personal.programas (personal_id);

create table personal.programa_dias (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references personal.programas (id) on delete cascade,
  ordem int not null default 1,
  nome text not null,
  observacao text
);
create index programa_dias_programa_idx on personal.programa_dias (programa_id);

create table personal.programa_exercicios (
  id uuid primary key default gen_random_uuid(),
  programa_dia_id uuid not null references personal.programa_dias (id) on delete cascade,
  exercicio_id uuid not null references personal.exercicios (id) on delete restrict,
  ordem int not null default 1,
  series int not null default 3 check (series between 1 and 20),
  repeticoes text not null default '10',
  carga text,
  descanso_seg int not null default 60 check (descanso_seg between 0 and 900),
  observacao text
);
create index programa_exercicios_dia_idx on personal.programa_exercicios (programa_dia_id);

-- Helpers (security definer) para as policies das tabelas filhas não recursarem no RLS
create or replace function personal.programa_do_meu_tenant(p_programa uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.programas p where p.id = p_programa and p.personal_id = personal.meu_personal_id());
$$;
create or replace function personal.programa_do_meu_aluno(p_programa uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.programas p where p.id = p_programa and p.aluno_id = personal.meu_aluno_id());
$$;
create or replace function personal.dia_do_meu_tenant(p_dia uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.programa_dias d join personal.programas p on p.id = d.programa_id
                 where d.id = p_dia and p.personal_id = personal.meu_personal_id());
$$;
create or replace function personal.dia_do_meu_aluno(p_dia uuid) returns boolean
language sql stable security definer set search_path = personal as $$
  select exists (select 1 from personal.programa_dias d join personal.programas p on p.id = d.programa_id
                 where d.id = p_dia and p.aluno_id = personal.meu_aluno_id());
$$;
revoke all on function personal.programa_do_meu_tenant(uuid), personal.programa_do_meu_aluno(uuid), personal.dia_do_meu_tenant(uuid), personal.dia_do_meu_aluno(uuid) from public;
grant execute on function personal.programa_do_meu_tenant(uuid), personal.programa_do_meu_aluno(uuid), personal.dia_do_meu_tenant(uuid), personal.dia_do_meu_aluno(uuid) to authenticated, service_role;

grant select, insert, update, delete on personal.programas, personal.programa_dias, personal.programa_exercicios to authenticated, service_role;
alter table personal.programas enable row level security;
alter table personal.programa_dias enable row level security;
alter table personal.programa_exercicios enable row level security;

create policy "programas: personal tudo" on personal.programas for all to authenticated
  using (personal_id = personal.meu_personal_id()) with check (personal_id = personal.meu_personal_id());
create policy "programas: aluno lê" on personal.programas for select to authenticated
  using (aluno_id = personal.meu_aluno_id());

create policy "dias: personal tudo" on personal.programa_dias for all to authenticated
  using (personal.programa_do_meu_tenant(programa_id)) with check (personal.programa_do_meu_tenant(programa_id));
create policy "dias: aluno lê" on personal.programa_dias for select to authenticated
  using (personal.programa_do_meu_aluno(programa_id));

create policy "prog_ex: personal tudo" on personal.programa_exercicios for all to authenticated
  using (personal.dia_do_meu_tenant(programa_dia_id)) with check (personal.dia_do_meu_tenant(programa_dia_id));
create policy "prog_ex: aluno lê" on personal.programa_exercicios for select to authenticated
  using (personal.dia_do_meu_aluno(programa_dia_id));
