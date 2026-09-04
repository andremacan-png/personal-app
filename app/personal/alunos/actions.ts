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

export async function atualizarAlunoAction(form: FormData) {
  await exigirUsuario("personal");
  const id = String(form.get("id") ?? "");
  const nome = String(form.get("nome") ?? "").trim();
  const telefone = String(form.get("telefone") ?? "").trim() || null;
  const status = String(form.get("status") ?? "");
  const permitidos = ["convidado", "ativo", "pausado", "encerrado"] as const;
  const { atualizarAluno } = await import("@/lib/dal/alunos");
  await atualizarAluno(id, {
    ...(nome.length >= 2 ? { nome } : {}),
    telefone,
    ...(permitidos.includes(status as (typeof permitidos)[number]) ? { status: status as (typeof permitidos)[number] } : {}),
  });
  revalidatePath(`/personal/alunos/${id}`); revalidatePath("/personal/alunos");
  redirect(`/personal/alunos/${id}`);
}
