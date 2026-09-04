"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { criarContaConfirmada, validarCadastro } from "@/lib/auth/cadastro";

export type EstadoConvite = { erro?: string } | undefined;

export async function aceitarConviteAction(_: EstadoConvite, form: FormData): Promise<EstadoConvite> {
  const token = String(form.get("token") ?? "");
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const invalido = validarCadastro(nome, email, senha);
  if (invalido) return { erro: invalido };

  const supabase = await criarClienteServidor();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) {
    const criado = await criarContaConfirmada({ email, senha, nome, papel: "aluno" });
    if (!criado.ok) return { erro: criado.erro };
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { erro: "Conta criada, mas não foi possível entrar: " + error.message };
  }

  const { error: eAceite } = await supabase.rpc("aceitar_convite", { p_token: token });
  if (eAceite) return { erro: eAceite.message.includes("já usado") ? "Este convite já foi usado." : eAceite.message };
  redirect("/aluno");
}
