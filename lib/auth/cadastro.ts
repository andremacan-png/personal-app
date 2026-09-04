import "server-only";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import type { Papel } from "./rotas";

export type ResultadoCadastro = { ok: true; userId: string } | { ok: false; erro: string };

/**
 * Cria a conta já confirmada (sem e-mail de confirmação): decisão #10 do piloto.
 * O gatilho do banco cria profiles (+ personals) a partir dos metadados.
 */
export async function criarContaConfirmada(dados: {
  email: string; senha: string; nome: string; papel: Papel;
}): Promise<ResultadoCadastro> {
  const admin = criarClienteAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
    user_metadata: { nome: dados.nome, papel: dados.papel },
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return { ok: false, erro: "Já existe uma conta com este e-mail. Entre com ela." };
    }
    return { ok: false, erro: error.message };
  }
  return { ok: true, userId: data.user.id };
}

export function validarCadastro(nome: string, email: string, senha: string): string | null {
  if (nome.trim().length < 2) return "Informe seu nome.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "E-mail inválido.";
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  return null;
}
