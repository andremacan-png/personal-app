import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";

export type StatusAluno = "convidado" | "ativo" | "pausado" | "encerrado";
export type Aluno = {
  id: string; nome: string; telefone: string | null; status: StatusAluno;
  convite_token: string; criado_em: string;
};

/** Lista os alunos do personal logado (RLS garante o tenant). */
export async function listarAlunos(): Promise<Aluno[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("alunos")
    .select("id, nome, telefone, status, convite_token, criado_em")
    .order("criado_em", { ascending: false });
  if (error) throw new Error("Falha ao listar alunos: " + error.message);
  return (data ?? []) as Aluno[];
}

export async function obterAluno(id: string): Promise<Aluno | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("alunos")
    .select("id, nome, telefone, status, convite_token, criado_em")
    .eq("id", id)
    .maybeSingle();
  return (data as Aluno | null) ?? null;
}

export async function meuPersonal(): Promise<{ id: string; nome: string } | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("personals").select("id, nome").limit(1).maybeSingle();
  return data ?? null;
}

export async function criarAluno(dados: { nome: string; telefone: string | null }): Promise<Aluno> {
  const supabase = await criarClienteServidor();
  const personal = await meuPersonal();
  if (!personal) throw new Error("Conta sem personal associado.");
  const { data, error } = await supabase
    .from("alunos")
    .insert({ personal_id: personal.id, nome: dados.nome, telefone: dados.telefone, status: "convidado" })
    .select("id, nome, telefone, status, convite_token, criado_em")
    .single();
  if (error) throw new Error("Falha ao criar aluno: " + error.message);
  return data as Aluno;
}
