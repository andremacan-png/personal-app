-- APP Personal · 0003 · Biblioteca de exercícios (globais do seed + próprios do personal)
create type personal.categoria_exercicio as enum ('forca', 'cardio', 'alongamento', 'pliometria', 'levantamento', 'strongman', 'mobilidade');

create table personal.exercicios (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid references personal.personals (id) on delete cascade,   -- null = global (seed)
  slug text not null,
  nome text not null,
  nome_en text,
  grupo_muscular text not null,
  musculos_secundarios text[] not null default '{}',
  equipamento text,
  categoria personal.categoria_exercicio not null default 'forca',
  nivel text,
  mecanica text,
  instrucoes text[] not null default '{}',
  imagens text[] not null default '{}',
  video_url text,
  contraindicacoes text[] not null default '{}',
  ativo boolean not null default true,
  origem text not null default 'personal',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index exercicios_slug_global_uq on personal.exercicios (slug) where personal_id is null;
create unique index exercicios_slug_personal_uq on personal.exercicios (personal_id, slug) where personal_id is not null;
create index exercicios_personal_idx on personal.exercicios (personal_id);
create index exercicios_grupo_idx on personal.exercicios (grupo_muscular);
create index exercicios_nome_idx on personal.exercicios (lower(nome));

grant select, insert, update, delete on personal.exercicios to authenticated, service_role;
alter table personal.exercicios enable row level security;

-- Leitura: globais para todo logado; próprios do personal; aluno vê os do seu personal.
create policy "exercicios: ler" on personal.exercicios
  for select to authenticated
  using (
    personal_id is null
    or personal_id = personal.meu_personal_id()
    or personal_id = (select a.personal_id from personal.alunos a where a.id = personal.meu_aluno_id())
  );
create policy "exercicios: personal cria" on personal.exercicios
  for insert to authenticated with check (personal_id = personal.meu_personal_id());
create policy "exercicios: personal edita" on personal.exercicios
  for update to authenticated using (personal_id = personal.meu_personal_id()) with check (personal_id = personal.meu_personal_id());
create policy "exercicios: personal apaga" on personal.exercicios
  for delete to authenticated using (personal_id = personal.meu_personal_id());
