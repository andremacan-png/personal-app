import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Limitacao } from "@/lib/dal/limitacoes";
import { REGIOES, ROTULO_REGIAO } from "@/lib/limitacoes";
import { alternarLimitacaoAction, criarLimitacaoAction, removerLimitacaoAction } from "@/app/personal/alunos/limitacoes-actions";

export function PainelLimitacoes({ alunoId, lista, papel }: { alunoId: string; lista: Limitacao[]; papel: "personal" | "aluno" }) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-medium">Limitações e cuidados</h2>
      <p className="text-sm text-neutral-500">{papel === "personal" ? "O app avisa quando um exercício do programa conflita com uma limitação ativa." : "Conte ao seu personal onde sente dor ou tem restrição. Ele adapta o treino."}</p>
      {lista.length > 0 && (
        <ul className="mt-3 divide-y rounded-md border text-sm">
          {lista.map((l) => (
            <li key={l.id} className={`flex flex-wrap items-center justify-between gap-2 p-2 ${l.ativa ? "" : "opacity-60"}`}>
              <div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${l.ativa ? "bg-amber-100 text-amber-900" : "bg-neutral-100 text-neutral-600"}`}>{ROTULO_REGIAO[l.regiao] ?? l.regiao}</span>
                {l.descricao && <span className="ml-2">{l.descricao}</span>}
                <span className="ml-2 text-xs text-neutral-400">{l.criado_por === "aluno" ? "informado pelo aluno" : ""}{l.desde ? ` · desde ${new Date(l.desde).toLocaleDateString("pt-BR")}` : ""}</span>
              </div>
              <div className="flex gap-1">
                {(papel === "personal" || l.criado_por === "aluno") && (
                  <form action={alternarLimitacaoAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="aluno_id" value={alunoId} /><input type="hidden" name="ativa" value={l.ativa ? "0" : "1"} />
                    <Button type="submit" size="sm" variant="ghost">{l.ativa ? "Resolvida" : "Reativar"}</Button></form>
                )}
                {papel === "personal" && (
                  <form action={removerLimitacaoAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="aluno_id" value={alunoId} />
                    <Button type="submit" size="sm" variant="ghost" className="text-red-600">✕</Button></form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <form action={criarLimitacaoAction} className="mt-3 flex flex-wrap items-end gap-2">
        <input type="hidden" name="aluno_id" value={alunoId} />
        <label className="text-xs text-neutral-500">Região<br />
          <select name="regiao" className="h-9 rounded-md border bg-white px-2 text-sm">{REGIOES.map(([v, r]) => <option key={v} value={v}>{r}</option>)}</select></label>
        <label className="min-w-48 flex-1 text-xs text-neutral-500">Descrição<br /><Input name="descricao" placeholder="ex.: dor ao agachar fundo" /></label>
        <label className="text-xs text-neutral-500">Desde<br /><Input name="desde" type="date" className="w-40" /></label>
        <Button type="submit" size="sm">Adicionar</Button>
      </form>
    </section>
  );
}
