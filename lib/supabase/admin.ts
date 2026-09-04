import "server-only";
import { createClient } from "@supabase/supabase-js";
import { OPCOES_DB } from "./config";

/**
 * Cliente de SERVIÇO: ignora RLS. Só no servidor, só para o que o usuário não pode fazer sozinho
 * (criar conta já confirmada). Nunca importar de componente de cliente.
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente no servidor");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    ...OPCOES_DB,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
