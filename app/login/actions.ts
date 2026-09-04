"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { destinoSeguro } from "@/lib/auth/rotas";

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
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (nome.length < 2) return { erro: "Informe seu nome." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    // O trigger no banco lê estes metadados para criar profiles + personals.
    options: { data: { nome, papel: "personal" } },
  });
  if (error) return { erro: error.message };
  redirect("/");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
