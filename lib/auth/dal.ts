import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Papel } from "@/lib/auth/rotas";

export type UsuarioAtual = {
  id: string;
  email: string | null;
  papel: Papel | null;
  nome: string | null;
};

/**
 * Data Access Layer: única porta de entrada para "quem está logado".
 * `cache` garante 1 consulta por requisição mesmo se vários componentes chamarem.
 */
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("papel, nome")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    papel: (perfil?.papel as Papel | undefined) ?? null,
    nome: perfil?.nome ?? null,
  };
});

/** Exige login e (opcionalmente) um papel. Redireciona em vez de renderizar. */
export async function exigirUsuario(papel?: Papel): Promise<UsuarioAtual> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/login");
  if (papel && usuario.papel !== papel) redirect("/");
  return usuario;
}
