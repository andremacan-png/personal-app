/** Regras puras de roteamento por papel. Sem I/O: testável em Vitest. */

export type Papel = "personal" | "aluno";

const ROTAS_PUBLICAS = ["/login", "/cadastro", "/auth/callback", "/convite"];

export function ehRotaPublica(caminho: string): boolean {
  return ROTAS_PUBLICAS.some((p) => caminho === p || caminho.startsWith(p + "/"));
}

export function rotaInicial(papel: Papel | null | undefined): string {
  switch (papel) {
    case "personal":
      return "/personal";
    case "aluno":
      return "/aluno";
    default:
      return "/onboarding";
  }
}

/** Só aceita destinos internos (evita open redirect via ?proximo=https://...). */
export function destinoSeguro(proximo: string | null | undefined, padrao: string): string {
  if (!proximo) return padrao;
  if (!proximo.startsWith("/") || proximo.startsWith("//")) return padrao;
  return proximo;
}
