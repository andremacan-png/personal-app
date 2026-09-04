import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Execucao = {
  id: string; aluno_id: string; programa_dia_id: string | null; nome_dia: string;
  iniciado_em: string; concluido_em: string | null; duracao_seg: number | null; rpe: number | null; observacao: string | null;
};
export type SerieRegistrada = {
  id: string; execucao_id: string; programa_exercicio_id: string | null; exercicio_id: string; nome_exercicio: string;
  ordem: number; serie: number; repeticoes: number | null; carga: number | null; concluida: boolean;
};
export type SerieEntrada = { programa_exercicio_id: string | null; exercicio_id: string; nome_exercicio: string; ordem: number; serie: number; repeticoes: number | null; carga: number | null; concluida: boolean };

/** Aluno logado: id da linha em `alunos`. */
export async function meuAlunoId(): Promise<string | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("alunos").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function listarExecucoes(alunoId: string, limite = 30): Promise<Execucao[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("execucoes").select("*").eq("aluno_id", alunoId).not("concluido_em", "is", null).order("concluido_em", { ascending: false }).limit(limite);
  if (error) throw new Error(error.message);
  return (data ?? []) as Execucao[];
}

export async function obterExecucao(id: string): Promise<{ execucao: Execucao; series: SerieRegistrada[] } | null> {
  const supabase = await criarClienteServidor();
  const { data: e } = await supabase.from("execucoes").select("*").eq("id", id).maybeSingle();
  if (!e) return null;
  const { data: s } = await supabase.from("execucao_series").select("*").eq("execucao_id", id).order("ordem").order("serie");
  return { execucao: e as Execucao, series: (s ?? []) as SerieRegistrada[] };
}

/** Última carga/reps registrada por item do programa (para pré-preencher o treino). */
export async function ultimasSeries(alunoId: string, programaExercicioIds: string[]): Promise<Record<string, { serie: number; repeticoes: number | null; carga: number | null }[]>> {
  if (programaExercicioIds.length === 0) return {};
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("execucao_series")
    .select("programa_exercicio_id, serie, repeticoes, carga, execucao:execucoes!inner(aluno_id, concluido_em)")
    .in("programa_exercicio_id", programaExercicioIds)
    .eq("execucao.aluno_id", alunoId)
    .not("execucao.concluido_em", "is", null)
    .order("concluido_em", { referencedTable: "execucoes", ascending: false })
    .limit(400);
  const porItem: Record<string, { execucao: string; series: { serie: number; repeticoes: number | null; carga: number | null }[] }> = {};
  type Linha = { programa_exercicio_id: string; serie: number; repeticoes: number | null; carga: number | null; execucao: { concluido_em: string } };
  const linhas = ((data ?? []) as unknown as Linha[]).sort((a, b) => b.execucao.concluido_em.localeCompare(a.execucao.concluido_em));
  for (const l of linhas) {
    const atual = porItem[l.programa_exercicio_id];
    if (!atual) porItem[l.programa_exercicio_id] = { execucao: l.execucao.concluido_em, series: [{ serie: l.serie, repeticoes: l.repeticoes, carga: l.carga }] };
    else if (atual.execucao === l.execucao.concluido_em) atual.series.push({ serie: l.serie, repeticoes: l.repeticoes, carga: l.carga });
  }
  return Object.fromEntries(Object.entries(porItem).map(([k, v]) => [k, v.series.sort((a, b) => a.serie - b.serie)]));
}

/** Última execução concluída por dia do programa (para mostrar "feito há X dias"). */
export async function ultimaExecucaoPorDia(alunoId: string, diaIds: string[]): Promise<Record<string, string>> {
  if (diaIds.length === 0) return {};
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("execucoes").select("programa_dia_id, concluido_em").eq("aluno_id", alunoId).in("programa_dia_id", diaIds).not("concluido_em", "is", null).order("concluido_em", { ascending: false });
  const r: Record<string, string> = {};
  for (const e of data ?? []) if (e.programa_dia_id && !r[e.programa_dia_id]) r[e.programa_dia_id] = e.concluido_em!;
  return r;
}

export async function registrarExecucao(d: {
  alunoId: string; programaDiaId: string | null; nomeDia: string; iniciadoEm: string; rpe: number | null; observacao: string | null; series: SerieEntrada[];
}): Promise<string> {
  const supabase = await criarClienteServidor();
  const agora = new Date();
  const inicio = new Date(d.iniciadoEm);
  const duracao = Number.isFinite(inicio.getTime()) ? Math.max(0, Math.round((agora.getTime() - inicio.getTime()) / 1000)) : null;
  const { data, error } = await supabase.from("execucoes").insert({
    aluno_id: d.alunoId, programa_dia_id: d.programaDiaId, nome_dia: d.nomeDia, iniciado_em: Number.isFinite(inicio.getTime()) ? inicio.toISOString() : agora.toISOString(),
    concluido_em: agora.toISOString(), duracao_seg: duracao, rpe: d.rpe, observacao: d.observacao,
  }).select("id").single();
  if (error) throw new Error(error.message);
  if (d.series.length) {
    const { error: e2 } = await supabase.from("execucao_series").insert(d.series.map((s) => ({ ...s, execucao_id: data.id })));
    if (e2) { await supabase.from("execucoes").delete().eq("id", data.id); throw new Error(e2.message); }
  }
  return data.id;
}

/** Execuções concluídas dos alunos de um personal nos últimos N dias (visão "quem treinou"). */
export async function execucoesDoTenant(dias = 7): Promise<Execucao[]> {
  const supabase = await criarClienteServidor();
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const { data } = await supabase.from("execucoes").select("*").not("concluido_em", "is", null).gte("concluido_em", desde).order("concluido_em", { ascending: false });
  return (data ?? []) as Execucao[];
}
