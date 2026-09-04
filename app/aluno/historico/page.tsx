import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { listarExecucoes, meuAlunoId } from "@/lib/dal/execucoes";
import { formatarDuracao } from "@/lib/datas";
import { NavAluno } from "@/components/nav-aluno";

export default async function PaginaHistorico() {
  await exigirUsuario("aluno");
  const alunoId = await meuAlunoId();
  const lista = alunoId ? await listarExecucoes(alunoId, 100) : [];
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Histórico</h1>
      <div className="mt-3"><NavAluno atual="/aluno/historico" /></div>
      {lista.length === 0 ? <p className="mt-6 text-neutral-500">Nenhum treino concluído ainda.</p> : (
        <ul className="mt-4 divide-y rounded-lg border">
          {lista.map((e) => (
            <li key={e.id}><Link href={`/aluno/historico/${e.id}`} className="flex items-center justify-between p-3 hover:bg-neutral-50">
              <div><p className="font-medium">{e.nome_dia}</p><p className="text-xs text-neutral-500">{new Date(e.concluido_em!).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}{e.duracao_seg ? ` · ${formatarDuracao(e.duracao_seg)}` : ""}{e.rpe ? ` · esforço ${e.rpe}` : ""}</p></div>
              <span className="text-neutral-400">›</span>
            </Link></li>
          ))}
        </ul>
      )}
    </main>
  );
}
