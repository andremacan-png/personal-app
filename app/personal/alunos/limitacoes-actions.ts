"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/dal";
import { alternarLimitacao, criarLimitacao, removerLimitacao } from "@/lib/dal/limitacoes";
import { meuAlunoId } from "@/lib/dal/execucoes";
import { REGIOES } from "@/lib/limitacoes";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const regiaoValida = (r: string) => REGIOES.some(([v]) => v === r);

export async function criarLimitacaoAction(form: FormData) {
  const u = await exigirUsuario();
  const regiao = s(form, "regiao");
  if (!regiaoValida(regiao)) return;
  let alunoId = s(form, "aluno_id");
  const criadoPor = u.papel === "aluno" ? "aluno" : "personal";
  if (criadoPor === "aluno") alunoId = (await meuAlunoId()) ?? "";
  if (!alunoId) return;
  await criarLimitacao({ alunoId, regiao, descricao: s(form, "descricao") || null, desde: s(form, "desde") || null, criadoPor });
  revalidatePath(`/personal/alunos/${alunoId}`); revalidatePath("/aluno/perfil");
}

export async function alternarLimitacaoAction(form: FormData) {
  await exigirUsuario();
  await alternarLimitacao(s(form, "id"), form.get("ativa") === "1");
  revalidatePath(`/personal/alunos/${s(form, "aluno_id")}`); revalidatePath("/aluno/perfil");
}

export async function removerLimitacaoAction(form: FormData) {
  await exigirUsuario("personal");
  await removerLimitacao(s(form, "id"));
  revalidatePath(`/personal/alunos/${s(form, "aluno_id")}`);
}
