-- 0001 · Fundação: identidade multi-tenant (profiles, personals, alunos) + RLS.
-- Regra da casa: toda tabela tem dono e policy; toda tabela nova ganha teste em tests/rls/.

create type public.papel as enum ('personal', 'aluno');
create type public.status_aluno as enum ('convidado', 'ativo', 'pausado', 'encerrado');

-- ---------- profiles (1:1 com auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  papel public.papel,
  nome text,
  criado_em timestamptz not null default now()
);

-- ---------- personals (o tenant) ----------
create table public.personals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

-- ---------- alunos (pertencem a 1 personal) ----------
create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personals (id) on delete cascade,
  profile_id uuid unique references public.profiles (id) on delete set null,
  nome text not null,
  telefone text,
  status public.status_aluno not null default 'convidado',
  convite_token uuid not null default gen_random_uuid() unique,
  criado_em timestamptz not null default now()
);
create index alunos_personal_idx on public.alunos (personal_id);

-- ---------- funções auxiliares (security definer, sem recursão de RLS) ----------
create or replace function public.meu_papel() returns public.papel
language sql stable security definer set search_path = public as $$
  select papel from public.profiles where id = auth.uid();
$$;

create or replace function public.meu_personal_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.personals where profile_id = auth.uid();
$$;

create or replace function public.meu_aluno_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.alunos where profile_id = auth.uid();
$$;

revoke all on function public.meu_papel(), public.meu_personal_id(), public.meu_aluno_id() from public;
grant execute on function public.meu_papel(), public.meu_personal_id(), public.meu_aluno_id() to authenticated;

-- ---------- trigger de signup: cria profile (+ personal quando papel = personal) ----------
create or replace function public.ao_criar_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_papel public.papel := nullif(new.raw_user_meta_data ->> 'papel', '')::public.papel;
  v_nome text := coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, papel, nome) values (new.id, v_papel, v_nome);
  if v_papel = 'personal' then
    insert into public.personals (profile_id, nome) values (new.id, v_nome);
  end if;
  return new;
end;
$$;

create trigger ao_criar_usuario after insert on auth.users
for each row execute function public.ao_criar_usuario();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.personals enable row level security;
alter table public.alunos enable row level security;

-- profiles: cada um vê e edita só o próprio (papel não é editável pelo usuário)
create policy "profiles: ler o próprio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: editar o próprio" on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and papel is not distinct from public.meu_papel());

-- personals: o personal vê/edita o próprio tenant; alunos veem o personal deles
create policy "personals: dono lê" on public.personals
  for select to authenticated
  using (profile_id = auth.uid() or id = (select personal_id from public.alunos where id = public.meu_aluno_id()));
create policy "personals: dono edita" on public.personals
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- alunos: personal manda no próprio tenant; aluno lê só a si mesmo
create policy "alunos: personal lê" on public.alunos
  for select to authenticated using (personal_id = public.meu_personal_id() or id = public.meu_aluno_id());
create policy "alunos: personal cria" on public.alunos
  for insert to authenticated with check (personal_id = public.meu_personal_id());
create policy "alunos: personal edita" on public.alunos
  for update to authenticated using (personal_id = public.meu_personal_id()) with check (personal_id = public.meu_personal_id());
create policy "alunos: personal apaga" on public.alunos
  for delete to authenticated using (personal_id = public.meu_personal_id());
