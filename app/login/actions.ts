"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { destinoSeguro } from "@/lib/auth/rotas";
import { criarContaConfirmada, validarCadastro } from "@/lib/auth/cadastro";

export type EstadoLogin = { erro?: string } | undefined;

export async function entrar(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const proximo = destinoSeguro(String(form.get("proximo") ?? ""), "/");

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos." };
  redirect(proximo);
}

export async function cadastrarPersonal(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const invalido = validarCadastro(nome, email, senha);
  if (invalido) return { erro: invalido };

  // Conta nasce confirmada pelo servidor (decisão #10): sem e-mail de confirmação no piloto.
  const criado = await criarContaConfirmada({ email, senha, nome, papel: "personal" });
  if (!criado.ok) return { erro: criado.erro };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "Conta criada, mas não foi possível entrar: " + error.message };
  redirect("/");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
