"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal } from "@/lib/dal/alunos";
import { atualizarExercicio, criarExercicio, type Categoria, type DadosExercicio } from "@/lib/dal/exercicios";

export type EstadoExercicio = { erro?: string } | undefined;

function lerDados(form: FormData): DadosExercicio | string {
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return "Informe o nome do exercício.";
  const linhas = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  const video = String(form.get("video_url") ?? "").trim();
  const imagem = String(form.get("imagem_url") ?? "").trim();
  return {
    nome,
    grupo_muscular: String(form.get("grupo_muscular") ?? "Corpo inteiro"),
    equipamento: String(form.get("equipamento") ?? "").trim() || null,
    categoria: (String(form.get("categoria") ?? "forca") as Categoria),
    instrucoes: linhas(String(form.get("instrucoes") ?? "")),
    contraindicacoes: linhas(String(form.get("contraindicacoes") ?? "")),
    musculos_secundarios: [],
    video_url: video || null,
    imagens: imagem ? [imagem] : [],
  };
}

export async function criarExercicioAction(_: EstadoExercicio, form: FormData): Promise<EstadoExercicio> {
  await exigirUsuario("personal");
  const dados = lerDados(form);
  if (typeof dados === "string") return { erro: dados };
  const personal = await meuPersonal();
  if (!personal) return { erro: "Conta sem personal associado." };
  let id: string;
  try { id = (await criarExercicio(personal.id, dados)).id; } catch (e) { return { erro: e instanceof Error ? e.message : "Erro ao salvar." }; }
  revalidatePath("/personal/exercicios");
  redirect(`/personal/exercicios/${id}`);
}

export async function atualizarExercicioAction(_: EstadoExercicio, form: FormData): Promise<EstadoExercicio> {
  await exigirUsuario("personal");
  const id = String(form.get("id") ?? "");
  const dados = lerDados(form);
  if (typeof dados === "string") return { erro: dados };
  try {
    const ok = await atualizarExercicio(id, dados);
    if (!ok) return { erro: "Este exercício não é seu (os da base não podem ser editados; duplique)." };
  } catch (e) { return { erro: e instanceof Error ? e.message : "Erro ao salvar." }; }
  revalidatePath("/personal/exercicios");
  redirect(`/personal/exercicios/${id}`);
}

export async function arquivarExercicioAction(form: FormData) {
  await exigirUsuario("personal");
  const id = String(form.get("id") ?? "");
  await atualizarExercicio(id, { ativo: false });
  revalidatePath("/personal/exercicios");
  redirect("/personal/exercicios");
}

/** Duplica um exercício da base como próprio, para o personal editar (vídeo, nome, instruções). */
export async function duplicarExercicioAction(form: FormData) {
  await exigirUsuario("personal");
  const { obterExercicio } = await import("@/lib/dal/exercicios");
  const origem = await obterExercicio(String(form.get("id") ?? ""));
  const personal = await meuPersonal();
  if (!origem || !personal) redirect("/personal/exercicios");
  const novo = await criarExercicio(personal.id, {
    nome: origem.nome, grupo_muscular: origem.grupo_muscular, equipamento: origem.equipamento, categoria: origem.categoria,
    instrucoes: origem.instrucoes, video_url: origem.video_url, imagens: origem.imagens, contraindicacoes: origem.contraindicacoes,
    musculos_secundarios: origem.musculos_secundarios,
  });
  revalidatePath("/personal/exercicios");
  redirect(`/personal/exercicios/${novo.id}/editar`);
}
