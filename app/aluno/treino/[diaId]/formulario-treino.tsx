"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { concluirTreinoAction } from "@/app/aluno/actions";

type Item = {
  id: string; exercicioId: string; nome: string; imagem: string | null; video: string | null;
  series: number; repeticoes: string; carga: string | null; descanso: number; observacao: string | null; instrucoes: string[];
  anteriores: { serie: number; repeticoes: number | null; carga: number | null }[];
};
type Serie = { reps: string; carga: string; feita: boolean };
type Estado = Record<string, Serie[]>;

function inicial(itens: Item[]): Estado {
  const e: Estado = {};
  for (const it of itens) {
    e[it.id] = Array.from({ length: it.series }, (_, i) => {
      const ant = it.anteriores[i];
      const repsSug = ant?.repeticoes ?? Number.parseInt(it.repeticoes, 10);
      return { reps: Number.isFinite(repsSug) ? String(repsSug) : "", carga: ant?.carga != null ? String(ant.carga) : (it.carga?.replace(/[^\d.,]/g, "").replace(",", ".") ?? ""), feita: false };
    });
  }
  return e;
}

export function FormularioTreino({ diaId, nomeDia, itens }: { diaId: string; nomeDia: string; itens: Item[] }) {
  const chave = `treino-rascunho-${diaId}`;
  const [estado, setEstado] = useState<Estado>(() => inicial(itens));
  const [iniciadoEm] = useState(() => new Date().toISOString());
  const [aberto, setAberto] = useState<string | null>(null);
  const [rpe, setRpe] = useState("");
  const [obs, setObs] = useState("");
  const [resultado, acao, pendente] = useActionState(concluirTreinoAction, undefined);

  // Rascunho local: refresh no meio do treino não perde nada.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(chave);
      if (!salvo) return;
      const r = JSON.parse(salvo);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação do rascunho salvo no aparelho
      if (r?.estado) setEstado(r.estado);
      if (r?.rpe) setRpe(r.rpe);
      if (r?.obs) setObs(r.obs);
    } catch {}
  }, [chave]);
  useEffect(() => { try { localStorage.setItem(chave, JSON.stringify({ estado, rpe, obs })); } catch {} }, [chave, estado, rpe, obs]);

  const feitas = useMemo(() => Object.values(estado).flat().filter((s) => s.feita).length, [estado]);
  const total = useMemo(() => Object.values(estado).flat().length, [estado]);

  function atualizar(itemId: string, i: number, patch: Partial<Serie>) {
    setEstado((e) => ({ ...e, [itemId]: e[itemId].map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  }
  function adicionarSerie(itemId: string) {
    setEstado((e) => { const ult = e[itemId][e[itemId].length - 1]; return { ...e, [itemId]: [...e[itemId], { reps: ult?.reps ?? "", carga: ult?.carga ?? "", feita: false }] }; });
  }

  const payload = JSON.stringify(itens.flatMap((it, ordem) => (estado[it.id] ?? []).map((s, i) => ({
    programa_exercicio_id: it.id, exercicio_id: it.exercicioId, nome_exercicio: it.nome, ordem: ordem + 1, serie: i + 1,
    repeticoes: s.reps === "" ? null : Number(s.reps), carga: s.carga === "" ? null : Number(String(s.carga).replace(",", ".")), concluida: s.feita,
  }))));

  return (
    <form action={acao} onSubmit={() => { try { localStorage.removeItem(chave); } catch {} }} className="mt-4">
      <input type="hidden" name="dia_id" value={diaId} />
      <input type="hidden" name="nome_dia" value={nomeDia} />
      <input type="hidden" name="iniciado_em" value={iniciadoEm} />
      <input type="hidden" name="series" value={payload} />

      <ol className="grid gap-3">
        {itens.map((it, n) => {
          const feitasItem = estado[it.id]?.filter((s) => s.feita).length ?? 0;
          return (
            <li key={it.id} className="rounded-xl border bg-white p-3">
              <div className="flex items-start gap-3">
                {it.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imagem} alt="" className="h-14 w-14 flex-none rounded-lg bg-neutral-100 object-cover" loading="lazy" />
                ) : <div className="h-14 w-14 flex-none rounded-lg bg-neutral-100" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{n + 1}. {it.nome}</p>
                  <p className="text-xs text-neutral-500">{it.series}×{it.repeticoes}{it.carga ? ` · ${it.carga}` : ""} · descanso {it.descanso}s</p>
                  {it.observacao && <p className="text-xs text-amber-700">{it.observacao}</p>}
                  <button type="button" onClick={() => setAberto(aberto === it.id ? null : it.id)} className="mt-1 text-xs underline text-neutral-600">
                    {aberto === it.id ? "esconder" : "como fazer"}
                  </button>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${feitasItem === estado[it.id]?.length ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"}`}>{feitasItem}/{estado[it.id]?.length ?? 0}</span>
              </div>
              {aberto === it.id && (
                <div className="mt-2 rounded-lg bg-neutral-50 p-2 text-sm text-neutral-700">
                  {it.instrucoes.length ? <ol className="list-decimal space-y-1 pl-4">{it.instrucoes.map((s, i) => <li key={i}>{s}</li>)}</ol> : <p>Sem instruções cadastradas.</p>}
                  {it.video && <a href={it.video} target="_blank" rel="noopener" className="mt-2 inline-block underline">Ver vídeo</a>}
                </div>
              )}
              <table className="mt-3 w-full text-sm">
                <thead><tr className="text-left text-xs text-neutral-500"><th className="w-8 pb-1">#</th><th className="pb-1">Reps</th><th className="pb-1">Carga (kg)</th><th className="w-14 pb-1 text-center">Feita</th></tr></thead>
                <tbody>
                  {(estado[it.id] ?? []).map((s, i) => (
                    <tr key={i} className={s.feita ? "opacity-70" : ""}>
                      <td className="py-1 text-neutral-500">{i + 1}</td>
                      <td className="py-1 pr-2"><input inputMode="numeric" value={s.reps} onChange={(e) => atualizar(it.id, i, { reps: e.target.value.replace(/\D/g, "") })} className="h-10 w-full rounded-md border px-2 text-base" aria-label={`Reps série ${i + 1}`} /></td>
                      <td className="py-1 pr-2"><input inputMode="decimal" value={s.carga} onChange={(e) => atualizar(it.id, i, { carga: e.target.value.replace(/[^\d.,]/g, "") })} className="h-10 w-full rounded-md border px-2 text-base" aria-label={`Carga série ${i + 1}`} /></td>
                      <td className="py-1 text-center">
                        <button type="button" onClick={() => atualizar(it.id, i, { feita: !s.feita })} aria-pressed={s.feita} aria-label={`Marcar série ${i + 1}`}
                          className={`h-10 w-10 rounded-full border text-lg ${s.feita ? "bg-green-600 text-white border-green-600" : "bg-white"}`}>{s.feita ? "✓" : ""}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={() => adicionarSerie(it.id)} className="mt-1 text-xs text-neutral-600 underline">+ série extra</button>
            </li>
          );
        })}
      </ol>

      <section className="mt-5 grid gap-3 rounded-xl border p-3">
        <label className="text-sm">Como foi o treino? (esforço de 1 a 10)
          <input name="rpe" inputMode="numeric" value={rpe} onChange={(e) => setRpe(e.target.value.replace(/\D/g, "").slice(0, 2))} className="mt-1 h-10 w-24 rounded-md border px-2 text-base" placeholder="7" />
        </label>
        <label className="text-sm">Observação para o personal
          <textarea name="observacao" value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="mt-1 w-full rounded-md border p-2 text-base" placeholder="ex.: joelho incomodou no agachamento" />
        </label>
      </section>

      {resultado?.erro && <p role="alert" className="mt-3 text-sm text-red-600">{resultado.erro}</p>}
      <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <span className="text-sm text-neutral-600">{feitas}/{total} séries</span>
          <Button type="submit" disabled={pendente || feitas === 0} className="flex-1">Concluir treino</Button>
        </div>
      </div>
    </form>
  );
}
