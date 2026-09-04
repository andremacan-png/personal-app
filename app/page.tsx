import { redirect } from "next/navigation";
import { obterUsuarioAtual } from "@/lib/auth/dal";
import { rotaInicial } from "@/lib/auth/rotas";

export default async function Raiz() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/login");
  redirect(rotaInicial(usuario.papel));
}
