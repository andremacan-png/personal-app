import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Limitacao = { id: string; aluno_id: string; regiao: string; descricao: string | null; desde: string | null; ativa: boolean; criado_por: string; criado_em: string };

export async function listarLimitacoes(alunoId: string, apenasAtivas = false): Promise<Limitacao[]> {
  const supabase = await criarClienteServidor();
  let q = supabase.from("aluno_limitacoes").select("*").eq("aluno_id", alunoId).order("ativa", { ascending: false }).order("criado_em", { ascending: false });
  if (apenasAtivas) q = q.eq("ativa", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Limitacao[];
}

export async function regioesAtivas(alunoId: string): Promise<string[]> {
  const l = await listarLimitacoes(alunoId, true);
  return [...new Set(l.map((x) => x.regiao))];
}

export async function criarLimitacao(d: { alunoId: string; regiao: string; descricao: string | null; desde: string | null; criadoPor: "personal" | "aluno" }) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("aluno_limitacoes").insert({ aluno_id: d.alunoId, regiao: d.regiao, descricao: d.descricao, desde: d.desde, criado_por: d.criadoPor });
  if (error) throw new Error(error.message);
}

export async function alternarLimitacao(id: string, ativa: boolean) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("aluno_limitacoes").update({ ativa }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removerLimitacao(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("aluno_limitacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
