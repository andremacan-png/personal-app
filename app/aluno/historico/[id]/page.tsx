import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterExecucao } from "@/lib/dal/execucoes";
import { formatarDuracao } from "@/lib/datas";
import { buttonVariants } from "@/components/ui/button";

export default async function PaginaExecucao({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  await exigirUsuario("aluno");
  const [{ id }, { novo }] = await Promise.all([params, searchParams]);
  const r = await obterExecucao(id);
  if (!r) notFound();
  const { execucao: e, series } = r;
  const porEx = new Map<string, typeof series>();
  for (const s of series) { const a = porEx.get(s.nome_exercicio) ?? []; a.push(s); porEx.set(s.nome_exercicio, a); }
  const volume = series.filter((s) => s.concluida).reduce((acc, s) => acc + (s.repeticoes ?? 0) * (s.carga ?? 0), 0);

  return (
    <main className="mx-auto max-w-md p-4">
      {novo ? (
        <div className="rounded-xl bg-green-50 p-4 text-center">
          <p className="text-2xl">💪</p>
          <h1 className="text-xl font-semibold text-green-900">Treino concluído!</h1>
          <p className="text-sm text-green-800">{series.filter((s) => s.concluida).length} séries · {formatarDuracao(e.duracao_seg) || "tempo não medido"}{volume ? ` · ${Math.round(volume)} kg movidos` : ""}</p>
        </div>
      ) : (
        <><Link href="/aluno/historico" className="text-sm text-neutral-500 hover:underline">← Histórico</Link><h1 className="text-xl font-semibold">{e.nome_dia}</h1></>
      )}
      <p className="mt-2 text-sm text-neutral-500">{new Date(e.concluido_em ?? e.iniciado_em).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}{e.rpe ? ` · esforço ${e.rpe}/10` : ""}</p>
      {e.observacao && <p className="mt-1 text-sm">“{e.observacao}”</p>}
      <ul className="mt-4 grid gap-2">
        {[...porEx.entries()].map(([nome, ss]) => (
          <li key={nome} className="rounded-lg border p-3">
            <p className="font-medium">{nome}</p>
            <p className="text-sm text-neutral-600">{ss.map((s) => `${s.repeticoes ?? "-"}×${s.carga != null ? `${s.carga}kg` : "-"}${s.concluida ? "" : " (pulada)"}`).join(" · ")}</p>
          </li>
        ))}
      </ul>
      <Link href="/aluno" className={`${buttonVariants()} mt-6 w-full`}>Voltar ao início</Link>
    </main>
  );
}
