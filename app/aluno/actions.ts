"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuAlunoId, registrarExecucao, type SerieEntrada } from "@/lib/dal/execucoes";

export type EstadoTreino = { erro?: string } | undefined;

export async function concluirTreinoAction(_: EstadoTreino, form: FormData): Promise<EstadoTreino> {
  await exigirUsuario("aluno");
  const alunoId = await meuAlunoId();
  if (!alunoId) return { erro: "Sua conta não está ligada a um personal." };
  let series: SerieEntrada[];
  try {
    series = JSON.parse(String(form.get("series") ?? "[]")) as SerieEntrada[];
  } catch { return { erro: "Dados do treino inválidos." }; }
  series = series
    .filter((s) => s && typeof s.exercicio_id === "string")
    .map((s) => ({
      programa_exercicio_id: s.programa_exercicio_id ?? null, exercicio_id: s.exercicio_id, nome_exercicio: String(s.nome_exercicio ?? "").slice(0, 120),
      ordem: Number(s.ordem) || 1, serie: Number(s.serie) || 1,
      repeticoes: s.repeticoes == null || s.repeticoes === ("" as unknown) ? null : Math.max(0, Math.min(999, Number(s.repeticoes))),
      carga: s.carga == null || s.carga === ("" as unknown) ? null : Math.max(0, Math.min(9999, Number(s.carga))),
      concluida: Boolean(s.concluida),
    }));
  if (!series.some((s) => s.concluida)) return { erro: "Marque pelo menos uma série feita." };
  const rpeRaw = Number(form.get("rpe"));
  let id: string;
  try {
    id = await registrarExecucao({
      alunoId, programaDiaId: String(form.get("dia_id") || "") || null, nomeDia: String(form.get("nome_dia") ?? "Treino"),
      iniciadoEm: String(form.get("iniciado_em") ?? ""), rpe: rpeRaw >= 1 && rpeRaw <= 10 ? rpeRaw : null,
      observacao: String(form.get("observacao") ?? "").trim() || null, series,
    });
  } catch (e) { return { erro: e instanceof Error ? e.message : "Não foi possível salvar." }; }
  revalidatePath("/aluno"); revalidatePath("/aluno/historico");
  redirect(`/aluno/historico/${id}?novo=1`);
}
