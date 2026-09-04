import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { contarExercicios, GRUPOS, listarExercicios, ROTULO_CATEGORIA } from "@/lib/dal/exercicios";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavPersonal } from "@/components/nav-personal";

export default async function PaginaExercicios({ searchParams }: { searchParams: Promise<{ q?: string; grupo?: string; origem?: string }> }) {
  await exigirUsuario("personal");
  const { q = "", grupo = "", origem = "todos" } = await searchParams;
  const [lista, total] = await Promise.all([
    listarExercicios({ busca: q, grupo: grupo || undefined, origem: origem as "todos" | "meus" | "base" }),
    contarExercicios(),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <NavPersonal atual="/personal/exercicios" />
      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Exercícios</h1>
          <p className="text-sm text-neutral-500">{total.base} da base · {total.meus} seus</p>
        </div>
        <Link href="/personal/exercicios/novo" className={buttonVariants()}>Novo exercício</Link>
      </header>

      <form className="mt-4 flex flex-wrap gap-2" action="/personal/exercicios">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome..." className="w-full sm:max-w-xs" />
        <select name="grupo" defaultValue={grupo} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="">Todos os grupos</option>
          {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select name="origem" defaultValue={origem} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="todos">Base + meus</option>
          <option value="meus">Só os meus</option>
          <option value="base">Só a base</option>
        </select>
        <button className={buttonVariants({ variant: "outline" })} type="submit">Filtrar</button>
        {(q || grupo || origem !== "todos") && <Link href="/personal/exercicios" className={buttonVariants({ variant: "ghost" })}>Limpar</Link>}
      </form>

      {lista.length === 0 ? (
        <p className="mt-8 text-center text-neutral-500">Nada encontrado.</p>
      ) : (
        <ul className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          {lista.map((e) => (
            <li key={e.id} className="min-w-0">
              <Link href={`/personal/exercicios/${e.id}`} className="flex min-w-0 gap-3 rounded-lg border p-3 hover:bg-neutral-50">
                {e.imagens[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.imagens[0]} alt="" className="h-16 w-16 flex-none rounded object-cover bg-neutral-100" loading="lazy" />
                ) : (
                  <div className="h-16 w-16 flex-none rounded bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.nome}</p>
                  <p className="text-sm text-neutral-500">{e.grupo_muscular}{e.equipamento ? ` · ${e.equipamento}` : ""}</p>
                  <p className="text-xs text-neutral-400">{ROTULO_CATEGORIA[e.categoria]}{e.personal_id ? " · seu" : ""}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {lista.length >= 60 && <p className="mt-3 text-center text-sm text-neutral-500">Mostrando os 60 primeiros. Refine a busca.</p>}
    </main>
  );
}
