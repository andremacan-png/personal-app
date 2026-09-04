import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterProgramaCompleto } from "@/lib/dal/programas";
import { GRUPOS, listarExercicios } from "@/lib/dal/exercicios";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adicionarExercicioAction } from "../../actions";

export default async function PaginaAdicionarExercicio({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dia?: string; q?: string; grupo?: string }> }) {
  await exigirUsuario("personal");
  const [{ id }, { dia, q = "", grupo = "" }] = await Promise.all([params, searchParams]);
  const p = await obterProgramaCompleto(id);
  const d = p?.dias.find((x) => x.id === dia);
  if (!p || !d) notFound();
  const lista = await listarExercicios({ busca: q, grupo: grupo || undefined, limite: 40 });
  const jaTem = new Set(d.exercicios.map((x) => x.exercicio_id));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href={`/personal/programas/${id}?dia=${d.id}`} className="text-sm text-neutral-500 hover:underline">← {p.nome} · {d.nome}</Link>
      <h1 className="text-2xl font-semibold">Adicionar exercício em {d.nome}</h1>
      <form className="mt-4 flex flex-wrap gap-2" action={`/personal/programas/${id}/adicionar`}>
        <input type="hidden" name="dia" value={d.id} />
        <Input name="q" defaultValue={q} placeholder="Buscar..." className="max-w-xs" autoFocus />
        <select name="grupo" defaultValue={grupo} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="">Todos os grupos</option>
          {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className={buttonVariants({ variant: "outline" })} type="submit">Buscar</button>
      </form>
      <ul className="mt-4 divide-y rounded-lg border">
        {lista.map((e) => (
          <li key={e.id} className="flex items-center gap-3 p-2">
            {e.imagens[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.imagens[0]} alt="" className="h-12 w-12 flex-none rounded bg-neutral-100 object-cover" loading="lazy" />
            ) : <div className="h-12 w-12 flex-none rounded bg-neutral-100" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.nome}</p>
              <p className="text-xs text-neutral-500">{e.grupo_muscular}{e.equipamento ? ` · ${e.equipamento}` : ""}{e.personal_id ? " · seu" : ""}</p>
            </div>
            <form action={adicionarExercicioAction}>
              <input type="hidden" name="programa_id" value={id} /><input type="hidden" name="dia_id" value={d.id} /><input type="hidden" name="exercicio_id" value={e.id} />
              <Button type="submit" size="sm" variant={jaTem.has(e.id) ? "outline" : "default"}>{jaTem.has(e.id) ? "Adicionar de novo" : "Adicionar"}</Button>
            </form>
          </li>
        ))}
        {lista.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">Nada encontrado. <Link href="/personal/exercicios/novo" className="underline">Criar exercício</Link></li>}
      </ul>
    </main>
  );
}
