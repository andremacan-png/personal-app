/** Regras puras do convite (sem I/O): link, WhatsApp e mensagem. Testadas em tests/convite.test.ts. */

export function linkConvite(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/convite/${token}`;
}

/** Normaliza telefone BR para o formato do wa.me (55 + DDD + número). Devolve null se não der. */
export function telefoneWhatsApp(telefone: string | null | undefined): string | null {
  if (!telefone) return null;
  let digitos = telefone.replace(/\D/g, "");
  if (digitos.startsWith("0")) digitos = digitos.slice(1);
  if (digitos.length === 10 || digitos.length === 11) digitos = "55" + digitos;
  if (!/^55\d{10,11}$/.test(digitos)) return null;
  return digitos;
}

export function mensagemConvite(nomeAluno: string, nomePersonal: string, link: string): string {
  const primeiro = nomeAluno.trim().split(/\s+/)[0];
  return `Oi ${primeiro}! Aqui é ${nomePersonal}. Seus treinos vão ficar no meu app. Entra por este link e cria sua senha: ${link}`;
}

export function linkWhatsApp(telefone: string | null | undefined, mensagem: string): string | null {
  const numero = telefoneWhatsApp(telefone);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
