-- APP Personal · 0001 · Fundação (schema próprio "personal", provisório dentro do projeto instagram-isabel)
-- Regra da casa: toda tabela tem dono e policy; toda tabela nova ganha teste em tests/rls/.
create schema if not exists personal;
grant usage on schema personal to authenticated, service_role;

create type personal.papel as enum ('personal', 'aluno');
create type personal.status_aluno as enum ('convidado', 'ativo', 'pausado', 'encerrado');

create table personal.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  papel personal.papel,
  nome text,
  criado_em timestamptz not null default now()
);

create table personal.personals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references personal.profiles (id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

create table personal.alunos (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references personal.personals (id) on delete cascade,
  profile_id uuid unique references personal.profiles (id) on delete set null,
  nome text not null,
  telefone text,
  status personal.status_aluno not null default 'convidado',
  convite_token uuid not null default gen_random_uuid() unique,
  criado_em timestamptz not null default now()
);
create index alunos_personal_idx on personal.alunos (personal_id);

create or replace function personal.meu_papel() returns personal.papel
language sql stable security definer set search_path = personal as $$
  select papel from personal.profiles where id = auth.uid();
$$;
create or replace function personal.meu_personal_id() returns uuid
language sql stable security definer set search_path = personal as $$
  select id from personal.personals where profile_id = auth.uid();
$$;
create or replace function personal.meu_aluno_id() returns uuid
language sql stable security definer set search_path = personal as $$
  select id from personal.alunos where profile_id = auth.uid();
$$;
revoke all on function personal.meu_papel(), personal.meu_personal_id(), personal.meu_aluno_id() from public;
grant execute on function personal.meu_papel(), personal.meu_personal_id(), personal.meu_aluno_id() to authenticated, service_role;

-- Só usuários criados pelo APP Personal (metadata.papel presente) ganham profile; outros apps deste projeto não são afetados.
create or replace function personal.ao_criar_usuario() returns trigger
language plpgsql security definer set search_path = personal as $$
declare
  v_papel personal.papel;
  v_nome text := coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1));
begin
  if new.raw_user_meta_data ->> 'papel' not in ('personal', 'aluno') then
    return new;
  end if;
  v_papel := (new.raw_user_meta_data ->> 'papel')::personal.papel;
  insert into personal.profiles (id, papel, nome) values (new.id, v_papel, v_nome);
  if v_papel = 'personal' then
    insert into personal.personals (profile_id, nome) values (new.id, v_nome);
  end if;
  return new;
end;
$$;
create trigger personal_ao_criar_usuario after insert on auth.users
for each row execute function personal.ao_criar_usuario();

grant select, insert, update, delete on all tables in schema personal to authenticated, service_role;
alter default privileges in schema personal grant select, insert, update, delete on tables to authenticated, service_role;

alter table personal.profiles enable row level security;
alter table personal.personals enable row level security;
alter table personal.alunos enable row level security;

create policy "profiles: ler o próprio" on personal.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: editar o próprio" on personal.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and papel is not distinct from personal.meu_papel());

create policy "personals: dono lê" on personal.personals
  for select to authenticated
  using (profile_id = auth.uid() or id = (select personal_id from personal.alunos where id = personal.meu_aluno_id()));
create policy "personals: dono edita" on personal.personals
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "alunos: personal lê" on personal.alunos
  for select to authenticated using (personal_id = personal.meu_personal_id() or id = personal.meu_aluno_id());
create policy "alunos: personal cria" on personal.alunos
  for insert to authenticated with check (personal_id = personal.meu_personal_id());
create policy "alunos: personal edita" on personal.alunos
  for update to authenticated using (personal_id = personal.meu_personal_id()) with check (personal_id = personal.meu_personal_id());
create policy "alunos: personal apaga" on personal.alunos
  for delete to authenticated using (personal_id = personal.meu_personal_id());
