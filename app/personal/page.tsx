import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { listarAlunos } from "@/lib/dal/alunos";
import { sair } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { NavPersonal } from "@/components/nav-personal";
import { contarExercicios } from "@/lib/dal/exercicios";
import { execucoesDoTenant } from "@/lib/dal/execucoes";
import { rotuloRelativo } from "@/lib/datas";

export default async function PainelPersonal() {
  const usuario = await exigirUsuario("personal");
  const [alunos, exercicios, execucoes] = await Promise.all([listarAlunos(), contarExercicios(), execucoesDoTenant(7)]);
  const porAluno = new Map<string, typeof execucoes>();
  for (const e of execucoes) { const a = porAluno.get(e.aluno_id) ?? []; a.push(e); porAluno.set(e.aluno_id, a); }
  const ativosLista = alunos.filter((a) => a.status === "ativo");
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

      <section className="mt-8">
        <h2 className="text-lg font-medium">Quem treinou nos últimos 7 dias</h2>
        {ativosLista.length === 0 ? <p className="mt-2 text-sm text-neutral-500">Nenhum aluno ativo ainda.</p> : (
          <ul className="mt-2 divide-y rounded-lg border">
            {ativosLista
              .map((a) => ({ a, ex: porAluno.get(a.id) ?? [] }))
              .sort((x, y) => y.ex.length - x.ex.length)
              .map(({ a, ex }) => (
                <li key={a.id} className="flex items-center justify-between p-3">
                  <Link href={`/personal/alunos/${a.id}`} className="font-medium hover:underline">{a.nome}</Link>
                  <div className="text-right text-sm">
                    <p className={ex.length === 0 ? "text-red-600" : "text-neutral-800"}>{ex.length === 0 ? "não treinou" : `${ex.length} treino${ex.length > 1 ? "s" : ""}`}</p>
                    {ex[0] && <p className="text-xs text-neutral-500">último {rotuloRelativo(ex[0].concluido_em)}{ex[0].observacao ? " · 💬" : ""}</p>}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
