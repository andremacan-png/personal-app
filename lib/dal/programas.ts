import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import { CAMPOS as CAMPOS_EX, type Exercicio } from "./exercicios";

export type Programa = {
  id: string; personal_id: string; aluno_id: string; nome: string; observacao: string | null;
  ativo: boolean; inicio: string; fim: string | null; criado_em: string;
};
export type ProgramaDia = { id: string; programa_id: string; ordem: number; nome: string; observacao: string | null };
export type ProgramaExercicio = {
  id: string; programa_dia_id: string; exercicio_id: string; ordem: number; series: number; repeticoes: string;
  carga: string | null; descanso_seg: number; observacao: string | null; exercicio: Exercicio;
};
export type DiaCompleto = ProgramaDia & { exercicios: ProgramaExercicio[] };
export type ProgramaCompleto = Programa & { dias: DiaCompleto[] };

const CAMPOS_PROG = "id, personal_id, aluno_id, nome, observacao, ativo, inicio, fim, criado_em";

export async function listarProgramasDoAluno(alunoId: string): Promise<Programa[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("programas").select(CAMPOS_PROG).eq("aluno_id", alunoId).order("ativo", { ascending: false }).order("criado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Programa[];
}

export async function obterProgramaCompleto(id: string): Promise<ProgramaCompleto | null> {
  const supabase = await criarClienteServidor();
  const { data: p } = await supabase.from("programas").select(CAMPOS_PROG).eq("id", id).maybeSingle();
  if (!p) return null;
  const { data: dias } = await supabase.from("programa_dias").select("id, programa_id, ordem, nome, observacao").eq("programa_id", id).order("ordem");
  const diaIds = (dias ?? []).map((d) => d.id);
  const { data: pex } = diaIds.length
    ? await supabase.from("programa_exercicios").select(`id, programa_dia_id, exercicio_id, ordem, series, repeticoes, carga, descanso_seg, observacao, exercicio:exercicios(${CAMPOS_EX})`).in("programa_dia_id", diaIds).order("ordem")
    : { data: [] };
  const porDia = new Map<string, ProgramaExercicio[]>();
  for (const x of (pex ?? []) as unknown as ProgramaExercicio[]) {
    const arr = porDia.get(x.programa_dia_id) ?? [];
    arr.push(x); porDia.set(x.programa_dia_id, arr);
  }
  return { ...(p as Programa), dias: (dias ?? []).map((d) => ({ ...(d as ProgramaDia), exercicios: porDia.get(d.id) ?? [] })) };
}

/** Programa ativo do aluno logado (ou de um aluno, para o personal). */
export async function programaAtivoDoAluno(alunoId: string): Promise<ProgramaCompleto | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("programas").select("id").eq("aluno_id", alunoId).eq("ativo", true).order("criado_em", { ascending: false }).limit(1).maybeSingle();
  return data ? obterProgramaCompleto(data.id) : null;
}

export async function criarPrograma(d: { personalId: string; alunoId: string; nome: string; dias: string[]; observacao?: string | null }): Promise<string> {
  const supabase = await criarClienteServidor();
  // Um programa ativo por vez: os anteriores ficam inativos (histórico preservado).
  await supabase.from("programas").update({ ativo: false }).eq("aluno_id", d.alunoId).eq("ativo", true);
  const { data, error } = await supabase.from("programas").insert({ personal_id: d.personalId, aluno_id: d.alunoId, nome: d.nome, observacao: d.observacao ?? null }).select("id").single();
  if (error) throw new Error(error.message);
  if (d.dias.length) {
    const { error: e2 } = await supabase.from("programa_dias").insert(d.dias.map((nome, i) => ({ programa_id: data.id, ordem: i + 1, nome })));
    if (e2) throw new Error(e2.message);
  }
  return data.id;
}

export async function atualizarPrograma(id: string, d: Partial<Pick<Programa, "nome" | "observacao" | "ativo" | "fim">>): Promise<boolean> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("programas").update({ ...d, atualizado_em: new Date().toISOString() }).eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function adicionarDia(programaId: string, nome: string): Promise<string> {
  const supabase = await criarClienteServidor();
  const { data: ult } = await supabase.from("programa_dias").select("ordem").eq("programa_id", programaId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase.from("programa_dias").insert({ programa_id: programaId, nome, ordem: (ult?.ordem ?? 0) + 1 }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function atualizarDia(id: string, d: Partial<Pick<ProgramaDia, "nome" | "observacao">>) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("programa_dias").update(d).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removerDia(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("programa_dias").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adicionarExercicioAoDia(diaId: string, exercicioId: string): Promise<string> {
  const supabase = await criarClienteServidor();
  const { data: ult } = await supabase.from("programa_exercicios").select("ordem").eq("programa_dia_id", diaId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase.from("programa_exercicios").insert({ programa_dia_id: diaId, exercicio_id: exercicioId, ordem: (ult?.ordem ?? 0) + 1 }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function atualizarExercicioDoDia(id: string, d: Partial<Pick<ProgramaExercicio, "series" | "repeticoes" | "carga" | "descanso_seg" | "observacao">>) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("programa_exercicios").update(d).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removerExercicioDoDia(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("programa_exercicios").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Troca a ordem de um item com o vizinho (direção -1 sobe, +1 desce). */
export async function moverExercicioDoDia(id: string, direcao: -1 | 1) {
  const supabase = await criarClienteServidor();
  const { data: atual } = await supabase.from("programa_exercicios").select("id, programa_dia_id, ordem").eq("id", id).single();
  if (!atual) return;
  const { data: lista } = await supabase.from("programa_exercicios").select("id, ordem").eq("programa_dia_id", atual.programa_dia_id).order("ordem");
  const arr = lista ?? [];
  const i = arr.findIndex((x) => x.id === id), j = i + direcao;
  if (i < 0 || j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  await Promise.all(arr.map((x, k) => supabase.from("programa_exercicios").update({ ordem: k + 1 }).eq("id", x.id)));
}

/** Programas do personal logado (todos os alunos), para copiar como modelo. */
export async function listarProgramasDoPersonal(): Promise<(Programa & { aluno_nome: string })[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("programas").select(`${CAMPOS_PROG}, aluno:alunos(nome)`).order("criado_em", { ascending: false }).limit(50);
  return ((data ?? []) as unknown as (Programa & { aluno: { nome: string } | null })[]).map((p) => ({ ...p, aluno_nome: p.aluno?.nome ?? "" }));
}

/** Duplica um programa (dias + exercícios) como novo programa ativo, para o mesmo aluno ou para outro (modelo). */
export async function duplicarPrograma(id: string, novoNome: string, alunoDestino?: string): Promise<string | null> {
  const origem = await obterProgramaCompleto(id);
  if (!origem) return null;
  const novoId = await criarPrograma({ personalId: origem.personal_id, alunoId: alunoDestino ?? origem.aluno_id, nome: novoNome, dias: origem.dias.map((d) => d.nome), observacao: origem.observacao });
  const novo = await obterProgramaCompleto(novoId);
  const supabase = await criarClienteServidor();
  for (const [i, dia] of origem.dias.entries()) {
    const destino = novo!.dias[i];
    if (dia.observacao) await supabase.from("programa_dias").update({ observacao: dia.observacao }).eq("id", destino.id);
    if (dia.exercicios.length) {
      await supabase.from("programa_exercicios").insert(dia.exercicios.map((x) => ({
        programa_dia_id: destino.id, exercicio_id: x.exercicio_id, ordem: x.ordem, series: x.series, repeticoes: x.repeticoes, carga: alunoDestino ? null : x.carga, descanso_seg: x.descanso_seg, observacao: x.observacao,
      })));
    }
  }
  return novoId;
}
