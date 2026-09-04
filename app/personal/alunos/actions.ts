"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/dal";
import { criarAluno } from "@/lib/dal/alunos";

export type EstadoNovoAluno = { erro?: string } | undefined;

export async function criarAlunoAction(_: EstadoNovoAluno, form: FormData): Promise<EstadoNovoAluno> {
  await exigirUsuario("personal");
  const nome = String(form.get("nome") ?? "").trim();
  const telefone = String(form.get("telefone") ?? "").trim() || null;
  if (nome.length < 2) return { erro: "Informe o nome do aluno." };
  let id: string;
  try {
    id = (await criarAluno({ nome, telefone })).id;
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Não foi possível criar o aluno." };
  }
  revalidatePath("/personal/alunos");
  redirect(`/personal/alunos?novo=${id}`);
}
