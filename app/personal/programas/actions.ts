"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal, obterAluno } from "@/lib/dal/alunos";
import {
  adicionarDia, adicionarExercicioAoDia, atualizarDia, atualizarExercicioDoDia, atualizarPrograma, criarPrograma,
  duplicarPrograma, moverExercicioDoDia, removerDia, removerExercicioDoDia,
} from "@/lib/dal/programas";

export type EstadoPrograma = { erro?: string } | undefined;
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const rev = (programaId: string) => revalidatePath(`/personal/programas/${programaId}`);

export async function criarProgramaAction(_: EstadoPrograma, form: FormData): Promise<EstadoPrograma> {
  await exigirUsuario("personal");
  const alunoId = s(form, "aluno_id"), nome = s(form, "nome") || "Treino";
  const qtd = Math.min(7, Math.max(1, Number(form.get("dias") ?? 3)));
  const aluno = await obterAluno(alunoId);
  const personal = await meuPersonal();
  if (!aluno || !personal) return { erro: "Aluno não encontrado." };
  const letras = ["A", "B", "C", "D", "E", "F", "G"];
  let id: string;
  try {
    id = await criarPrograma({ personalId: personal.id, alunoId, nome, dias: letras.slice(0, qtd).map((l) => `Treino ${l}`), observacao: s(form, "observacao") || null });
  } catch (e) { return { erro: e instanceof Error ? e.message : "Erro ao criar programa." }; }
  revalidatePath(`/personal/alunos/${alunoId}`);
  redirect(`/personal/programas/${id}`);
}

export async function renomearProgramaAction(form: FormData) {
  await exigirUsuario("personal");
  const id = s(form, "programa_id");
  await atualizarPrograma(id, { nome: s(form, "nome") || "Treino", observacao: s(form, "observacao") || null });
  rev(id);
}

export async function alternarAtivoAction(form: FormData) {
  await exigirUsuario("personal");
  const id = s(form, "programa_id");
  await atualizarPrograma(id, { ativo: form.get("ativo") === "1" });
  rev(id); revalidatePath(`/personal/alunos/${s(form, "aluno_id")}`);
}

export async function duplicarProgramaAction(form: FormData) {
  await exigirUsuario("personal");
  const novo = await duplicarPrograma(s(form, "programa_id"), s(form, "nome") || "Cópia do treino");
  if (novo) redirect(`/personal/programas/${novo}`);
}

export async function adicionarDiaAction(form: FormData) {
  await exigirUsuario("personal");
  const id = s(form, "programa_id");
  await adicionarDia(id, s(form, "nome") || "Novo dia");
  rev(id);
}

export async function renomearDiaAction(form: FormData) {
  await exigirUsuario("personal");
  await atualizarDia(s(form, "dia_id"), { nome: s(form, "nome") || "Dia", observacao: s(form, "observacao") || null });
  rev(s(form, "programa_id"));
}

export async function removerDiaAction(form: FormData) {
  await exigirUsuario("personal");
  await removerDia(s(form, "dia_id"));
  rev(s(form, "programa_id"));
}

export async function adicionarExercicioAction(form: FormData) {
  await exigirUsuario("personal");
  const programaId = s(form, "programa_id"), diaId = s(form, "dia_id"), trocar = s(form, "trocar");
  const novoId = await adicionarExercicioAoDia(diaId, s(form, "exercicio_id"));
  if (trocar) {
    // Troca: herda séries/reps/descanso/observação do item antigo, assume a posição dele e o remove.
    const { obterProgramaCompleto, atualizarExercicioDoDia: atualizar, removerExercicioDoDia: remover } = await import("@/lib/dal/programas");
    const prog = await obterProgramaCompleto(programaId);
    const antigo = prog?.dias.flatMap((d) => d.exercicios).find((x) => x.id === trocar);
    if (antigo) {
      await atualizar(novoId, { series: antigo.series, repeticoes: antigo.repeticoes, descanso_seg: antigo.descanso_seg, observacao: antigo.observacao });
      const { criarClienteServidor } = await import("@/lib/supabase/server");
      const supabase = await criarClienteServidor();
      await supabase.from("programa_exercicios").update({ ordem: antigo.ordem }).eq("id", novoId);
      await remover(antigo.id);
    }
  }
  rev(programaId);
  redirect(`/personal/programas/${programaId}?dia=${diaId}`);
}

export async function atualizarItemAction(form: FormData) {
  await exigirUsuario("personal");
  const series = Math.min(20, Math.max(1, Number(form.get("series") || 3)));
  const descanso = Math.min(900, Math.max(0, Number(form.get("descanso_seg") || 60)));
  await atualizarExercicioDoDia(s(form, "item_id"), {
    series, repeticoes: s(form, "repeticoes") || "10", carga: s(form, "carga") || null, descanso_seg: descanso, observacao: s(form, "observacao") || null,
  });
  rev(s(form, "programa_id"));
}

export async function removerItemAction(form: FormData) {
  await exigirUsuario("personal");
  await removerExercicioDoDia(s(form, "item_id"));
  rev(s(form, "programa_id"));
}

export async function moverItemAction(form: FormData) {
  await exigirUsuario("personal");
  await moverExercicioDoDia(s(form, "item_id"), form.get("direcao") === "-1" ? -1 : 1);
  rev(s(form, "programa_id"));
}
