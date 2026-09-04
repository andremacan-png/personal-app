import { createBrowserClient } from "@supabase/ssr";
import { OPCOES_DB } from "./config";

/** Cliente para componentes de cliente (navegador). */
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    OPCOES_DB,
  );
}
