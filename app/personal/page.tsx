import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { listarAlunos } from "@/lib/dal/alunos";
import { sair } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { NavPersonal } from "@/components/nav-personal";
import { contarExercicios } from "@/lib/dal/exercicios";

export default async function PainelPersonal() {
  const usuario = await exigirUsuario("personal");
  const [alunos, exercicios] = await Promise.all([listarAlunos(), contarExercicios()]);
  const ativos = alunos.filter((a) => a.status === "ativo").length;
  const pendentes = alunos.filter((a) => a.status === "convidado").length;
  return (
    <main className="mx-auto max-w-3xl p-6">
      <NavPersonal atual="/personal" />
      <header className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Olá, {usuario.nome ?? "personal"}</h1>
        <form action={sair}><Button variant="outline" size="sm">Sair</Button></form>
      </header>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/personal/alunos" className="rounded-lg border p-4 hover:bg-neutral-50">
          <p className="text-sm text-neutral-500">Alunos</p>
          <p className="text-3xl font-semibold">{ativos}</p>
          <p className="text-sm text-neutral-500">{pendentes > 0 ? `${pendentes} convite(s) pendente(s)` : "todos ativos"}</p>
        </Link>
        <Link href="/personal/exercicios" className="rounded-lg border p-4 hover:bg-neutral-50">
          <p className="text-sm text-neutral-500">Exercícios</p>
          <p className="text-3xl font-semibold">{exercicios.base + exercicios.meus}</p>
          <p className="text-sm text-neutral-500">{exercicios.meus} seus · {exercicios.base} da base</p>
        </Link>
      </section>
    </main>
  );
}
