import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterProgramaCompleto } from "@/lib/dal/programas";
import { GRUPOS, listarExercicios } from "@/lib/dal/exercicios";
import { regioesAtivas } from "@/lib/dal/limitacoes";
import { conflitos, ROTULO_REGIAO } from "@/lib/limitacoes";
import { iaDisponivel, sugerirAlternativas } from "@/lib/ia/sugestoes";
import { listarLimitacoes } from "@/lib/dal/limitacoes";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adicionarExercicioAction } from "../../actions";

export default async function PaginaAdicionarExercicio({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dia?: string; q?: string; grupo?: string; trocar?: string; ia?: string }> }) {
  await exigirUsuario("personal");
  const [{ id }, { dia, q = "", grupo = "", trocar = "", ia = "" }] = await Promise.all([params, searchParams]);
  const p = await obterProgramaCompleto(id);
  const d = p?.dias.find((x) => x.id === dia);
  if (!p || !d) notFound();
  const [listaBruta, limitacoes] = await Promise.all([listarExercicios({ busca: q, grupo: grupo || undefined, limite: 60 }), regioesAtivas(p.aluno_id)]);
  const lista = listaBruta.map((e) => ({ ...e, conflito: conflitos(e.contraindicacoes, limitacoes) })).sort((a, b) => a.conflito.length - b.conflito.length);
  const trocando = d.exercicios.find((x) => x.id === trocar);
  let sugestoes: { exercicio_id: string; motivo: string }[] = [];
  if (ia === "1" && trocando && limitacoes.length > 0) {
    const candidatos = lista.filter((e) => e.conflito.length === 0 && e.id !== trocando.exercicio_id);
    const detalhes = await listarLimitacoes(p.aluno_id, true);
    sugestoes = await sugerirAlternativas({ original: trocando.exercicio, limitacoes, candidatos, observacao: detalhes.map((l) => l.descricao).filter(Boolean).join("; ") || null });
  }
  const porId = new Map(lista.map((e) => [e.id, e]));
  const jaTem = new Set(d.exercicios.map((x) => x.exercicio_id));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href={`/personal/programas/${id}?dia=${d.id}`} className="text-sm text-neutral-500 hover:underline">← {p.nome} · {d.nome}</Link>
      <h1 className="text-2xl font-semibold">{trocando ? `Trocar "${trocando.exercicio.nome}"` : `Adicionar exercício em ${d.nome}`}</h1>
      {limitacoes.length > 0 && <p className="text-sm text-neutral-600">Sem conflito primeiro; ⚠ marca conflito com: {limitacoes.map((r) => ROTULO_REGIAO[r] ?? r).join(", ")}.</p>}
      <form className="mt-4 flex flex-wrap gap-2" action={`/personal/programas/${id}/adicionar`}>
        <input type="hidden" name="dia" value={d.id} />{trocar && <input type="hidden" name="trocar" value={trocar} />}
        <Input name="q" defaultValue={q} placeholder="Buscar..." className="max-w-xs" autoFocus />
        <select name="grupo" defaultValue={grupo} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="">Todos os grupos</option>
          {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className={buttonVariants({ variant: "outline" })} type="submit">Buscar</button>
      </form>
      {trocando && limitacoes.length > 0 && (
        <section className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-violet-900">Sugestão da IA (você decide)</p>
            {ia !== "1" ? (
              iaDisponivel()
                ? <Link href={`?dia=${d.id}&trocar=${trocar}&grupo=${encodeURIComponent(grupo || trocando.exercicio.grupo_muscular)}&ia=1`} className={buttonVariants({ size: "sm" })}>Pedir 3 alternativas</Link>
                : <span className="text-xs text-violet-800">IA não configurada neste ambiente (ANTHROPIC_API_KEY).</span>
            ) : sugestoes.length === 0 ? <span className="text-xs text-violet-800">Sem sugestão desta vez; use a lista abaixo.</span> : null}
          </div>
          {sugestoes.length > 0 && (
            <ul className="mt-2 grid gap-2">
              {sugestoes.map((sg) => { const e = porId.get(sg.exercicio_id); if (!e) return null; return (
                <li key={sg.exercicio_id} className="flex items-center gap-3 rounded-md bg-white p-2">
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{e.nome}</p><p className="text-xs text-neutral-600">{sg.motivo}</p></div>
                  <form action={adicionarExercicioAction}>
                    <input type="hidden" name="programa_id" value={id} /><input type="hidden" name="dia_id" value={d.id} /><input type="hidden" name="exercicio_id" value={e.id} /><input type="hidden" name="trocar" value={trocando.id} />
                    <Button type="submit" size="sm">Trocar por este</Button>
                  </form>
                </li>); })}
            </ul>
          )}
        </section>
      )}

      <ul className="mt-4 divide-y rounded-lg border">
        {lista.map((e) => (
          <li key={e.id} className="flex min-w-0 items-center gap-3 p-2">
            {e.imagens[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.imagens[0]} alt="" className="h-12 w-12 flex-none rounded bg-neutral-100 object-cover" loading="lazy" />
            ) : <div className="h-12 w-12 flex-none rounded bg-neutral-100" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.nome}</p>
              <p className="text-xs text-neutral-500">{e.grupo_muscular}{e.equipamento ? ` · ${e.equipamento}` : ""}{e.personal_id ? " · seu" : ""}</p>
              {e.conflito.length > 0 && <p className="text-xs text-amber-800">⚠ {e.conflito.map((r) => ROTULO_REGIAO[r] ?? r).join(", ")}</p>}
            </div>
            <form action={adicionarExercicioAction}>
              <input type="hidden" name="programa_id" value={id} /><input type="hidden" name="dia_id" value={d.id} /><input type="hidden" name="exercicio_id" value={e.id} />
              {trocando && <input type="hidden" name="trocar" value={trocando.id} />}
              <Button type="submit" size="sm" variant={jaTem.has(e.id) ? "outline" : "default"}>{trocando ? "Trocar por este" : jaTem.has(e.id) ? "Adicionar de novo" : "Adicionar"}</Button>
            </form>
          </li>
        ))}
        {lista.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">Nada encontrado. <Link href="/personal/exercicios/novo" className="underline">Criar exercício</Link></li>}
      </ul>
    </main>
  );
}
