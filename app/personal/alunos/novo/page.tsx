import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { FormularioNovoAluno } from "./formulario";

export default async function PaginaNovoAluno() {
  await exigirUsuario("personal");
  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/personal/alunos" className="text-sm text-neutral-500 hover:underline">← Alunos</Link>
      <h1 className="text-2xl font-semibold">Novo aluno</h1>
      <p className="mt-1 text-sm text-neutral-600">Só nome e WhatsApp. O aluno completa o resto ao aceitar o convite.</p>
      <FormularioNovoAluno />
    </main>
  );
}
