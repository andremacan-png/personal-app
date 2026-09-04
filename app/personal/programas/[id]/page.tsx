import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterAluno } from "@/lib/dal/alunos";
import { obterProgramaCompleto } from "@/lib/dal/programas";
import { regioesAtivas } from "@/lib/dal/limitacoes";
import { conflitos, ROTULO_REGIAO } from "@/lib/limitacoes";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavPersonal } from "@/components/nav-personal";
import {
  adicionarDiaAction, alternarAtivoAction, atualizarItemAction, duplicarProgramaAction, moverItemAction,
  removerDiaAction, removerItemAction, renomearDiaAction, renomearProgramaAction,
} from "../actions";

export default async function PaginaPrograma({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dia?: string }> }) {
  await exigirUsuario("personal");
  const [{ id }, { dia: diaSel }] = await Promise.all([params, searchParams]);
  const p = await obterProgramaCompleto(id);
  if (!p) notFound();
  const [aluno, limitacoes] = await Promise.all([obterAluno(p.aluno_id), regioesAtivas(p.aluno_id)]);
  const totalConflitos = p.dias.flatMap((d) => d.exercicios).filter((x) => conflitos(x.exercicio.contraindicacoes, limitacoes).length > 0).length;
  const diaAtual = p.dias.find((d) => d.id === diaSel) ?? p.dias[0];
  const inp = "h-8 rounded-md border bg-white px-2 text-sm";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <NavPersonal atual="/personal/alunos" />
      <Link href={`/personal/alunos/${p.aluno_id}`} className="mt-4 inline-block text-sm text-neutral-500 hover:underline">← {aluno?.nome ?? "Aluno"}</Link>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <form action={renomearProgramaAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="programa_id" value={p.id} />
          <Input name="nome" defaultValue={p.nome} className="w-64 text-lg font-semibold" aria-label="Nome do programa" />
          <Input name="observacao" defaultValue={p.observacao ?? ""} placeholder="Observação geral (opcional)" className="w-72" aria-label="Observação" />
          <Button type="submit" variant="outline" size="sm">Salvar</Button>
        </form>
        <div className="flex gap-2">
          <form action={alternarAtivoAction}>
            <input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="aluno_id" value={p.aluno_id} />
            <input type="hidden" name="ativo" value={p.ativo ? "0" : "1"} />
            <Button type="submit" variant="outline" size="sm">{p.ativo ? "Encerrar programa" : "Reativar"}</Button>
          </form>
          <form action={duplicarProgramaAction}>
            <input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="nome" value={`${p.nome} (cópia)`} />
            <Button type="submit" variant="outline" size="sm">Duplicar</Button>
          </form>
        </div>
      </header>
      {!p.ativo && <p className="mt-2 rounded bg-neutral-100 p-2 text-sm text-neutral-600">Programa encerrado: o aluno não vê este treino.</p>}
      {limitacoes.length > 0 && (
        <p className={`mt-2 rounded p-2 text-sm ${totalConflitos ? "bg-amber-50 text-amber-900" : "bg-neutral-50 text-neutral-600"}`}>
          Limitações ativas de {aluno?.nome?.split(" ")[0]}: {limitacoes.map((r) => ROTULO_REGIAO[r] ?? r).join(", ")}.
          {totalConflitos ? ` ⚠ ${totalConflitos} exercício(s) com possível conflito, marcados abaixo.` : " Nenhum conflito no programa."}
        </p>
      )}

      {/* abas de dias */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {p.dias.map((d) => (
          <Link key={d.id} href={`?dia=${d.id}`} className={`rounded-full border px-3 py-1 text-sm ${d.id === diaAtual?.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}>
            {d.nome} <span className="opacity-60">({d.exercicios.length})</span>
          </Link>
        ))}
        <form action={adicionarDiaAction} className="flex items-center gap-1">
          <input type="hidden" name="programa_id" value={p.id} />
          <Input name="nome" placeholder="Novo dia" className="h-8 w-28" />
          <Button type="submit" size="sm" variant="ghost">+ dia</Button>
        </form>
      </div>

      {diaAtual && (
        <section className="mt-4 rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-neutral-50 p-3">
            <form action={renomearDiaAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="dia_id" value={diaAtual.id} />
              <Input name="nome" defaultValue={diaAtual.nome} className="h-8 w-40 font-medium" aria-label="Nome do dia" />
              <Input name="observacao" defaultValue={diaAtual.observacao ?? ""} placeholder="Observação do dia (ex.: aquecer 10 min)" className="h-8 w-72" aria-label="Observação do dia" />
              <Button type="submit" size="sm" variant="ghost">Salvar</Button>
            </form>
            <div className="flex gap-2">
              <Link href={`/personal/programas/${p.id}/adicionar?dia=${diaAtual.id}`} className={buttonVariants({ size: "sm" })}>+ Exercício</Link>
              {p.dias.length > 1 && (
                <form action={removerDiaAction}>
                  <input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="dia_id" value={diaAtual.id} />
                  <Button type="submit" size="sm" variant="ghost" className="text-red-600">Remover dia</Button>
                </form>
              )}
            </div>
          </div>

          {diaAtual.exercicios.length === 0 ? (
            <p className="p-6 text-center text-sm text-neutral-500">Nenhum exercício neste dia. Clique em &quot;+ Exercício&quot;.</p>
          ) : (
            <ol className="divide-y">
              {diaAtual.exercicios.map((x, i) => (
                <li key={x.id} className="p-3">
                  <div className="flex items-start gap-3">
                    {x.exercicio.imagens[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.exercicio.imagens[0]} alt="" className="h-14 w-14 flex-none rounded bg-neutral-100 object-cover" loading="lazy" />
                    ) : <div className="h-14 w-14 flex-none rounded bg-neutral-100" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium"><span className="text-neutral-400">{i + 1}.</span> {x.exercicio.nome} <span className="text-xs text-neutral-500">· {x.exercicio.grupo_muscular}</span></p>
                      {conflitos(x.exercicio.contraindicacoes, limitacoes).length > 0 && (
                        <p className="mt-0.5 text-xs text-amber-800">⚠ Cuidado com {conflitos(x.exercicio.contraindicacoes, limitacoes).map((r) => ROTULO_REGIAO[r] ?? r).join(", ")}.{" "}
                          <Link href={`/personal/programas/${p.id}/adicionar?dia=${diaAtual.id}&grupo=${encodeURIComponent(x.exercicio.grupo_muscular)}&trocar=${x.id}`} className="underline">Ver alternativas</Link></p>
                      )}
                      <form action={atualizarItemAction} className="mt-2 flex flex-wrap items-end gap-2">
                        <input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="item_id" value={x.id} />
                        <label className="text-xs text-neutral-500">Séries<br /><input name="series" type="number" min={1} max={20} defaultValue={x.series} className={`${inp} w-16`} /></label>
                        <label className="text-xs text-neutral-500">Reps<br /><input name="repeticoes" defaultValue={x.repeticoes} className={`${inp} w-20`} placeholder="8-12" /></label>
                        <label className="text-xs text-neutral-500">Carga<br /><input name="carga" defaultValue={x.carga ?? ""} className={`${inp} w-24`} placeholder="20 kg" /></label>
                        <label className="text-xs text-neutral-500">Descanso (s)<br /><input name="descanso_seg" type="number" min={0} max={900} step={15} defaultValue={x.descanso_seg} className={`${inp} w-24`} /></label>
                        <label className="min-w-40 flex-1 text-xs text-neutral-500">Observação<br /><input name="observacao" defaultValue={x.observacao ?? ""} className={`${inp} w-full`} placeholder="ex.: cadência lenta" /></label>
                        <Button type="submit" size="sm" variant="outline">Salvar</Button>
                      </form>
                    </div>
                    <div className="flex flex-none flex-col gap-1">
                      <form action={moverItemAction}><input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="item_id" value={x.id} /><input type="hidden" name="direcao" value="-1" /><Button type="submit" size="sm" variant="ghost" aria-label="Subir" disabled={i === 0}>↑</Button></form>
                      <form action={moverItemAction}><input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="item_id" value={x.id} /><input type="hidden" name="direcao" value="1" /><Button type="submit" size="sm" variant="ghost" aria-label="Descer" disabled={i === diaAtual.exercicios.length - 1}>↓</Button></form>
                      <form action={removerItemAction}><input type="hidden" name="programa_id" value={p.id} /><input type="hidden" name="item_id" value={x.id} /><Button type="submit" size="sm" variant="ghost" className="text-red-600" aria-label="Remover">✕</Button></form>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </main>
  );
}
