-- APP Personal · 0002 · Convite do aluno (RPCs). Schema "personal".
-- anon só pode chamar info_convite (nomes); nenhuma tabela é legível por anon.
grant usage on schema personal to anon;

create or replace function personal.info_convite(p_token uuid)
returns table (aluno text, personal text, disponivel boolean)
language sql stable security definer set search_path = personal as $$
  select a.nome, p.nome, (a.profile_id is null and a.status = 'convidado')
  from personal.alunos a join personal.personals p on p.id = a.personal_id
  where a.convite_token = p_token;
$$;
revoke all on function personal.info_convite(uuid) from public;
grant execute on function personal.info_convite(uuid) to anon, authenticated;

create or replace function personal.aceitar_convite(p_token uuid) returns uuid
language plpgsql security definer set search_path = personal as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'não autenticado' using errcode = '28000';
  end if;
  if personal.meu_papel() is distinct from 'aluno' then
    raise exception 'só contas de aluno aceitam convite' using errcode = '42501';
  end if;
  update personal.alunos
     set profile_id = auth.uid(), status = 'ativo'
   where convite_token = p_token and profile_id is null and status = 'convidado'
  returning id into v_id;
  if v_id is null then
    raise exception 'convite inválido ou já usado' using errcode = 'P0001';
  end if;
  return v_id;
end;
$$;
revoke all on function personal.aceitar_convite(uuid) from public;
grant execute on function personal.aceitar_convite(uuid) to authenticated;
