import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal } from "@/lib/dal/alunos";
import { programaAtivoDoAluno } from "@/lib/dal/programas";
import { listarExecucoes, meuAlunoId, ultimaExecucaoPorDia } from "@/lib/dal/execucoes";
import { rotuloRelativo } from "@/lib/datas";
import { resumirConsistencia } from "@/lib/streak";
import { CalendarioPresenca } from "@/components/calendario-presenca";
import { listarLimitacoes } from "@/lib/dal/limitacoes";
import { sair } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { NavAluno } from "@/components/nav-aluno";

export default async function InicioAluno() {
  const usuario = await exigirUsuario("aluno");
  const [personal, alunoId] = await Promise.all([meuPersonal(), meuAlunoId()]);
  const programa = alunoId ? await programaAtivoDoAluno(alunoId) : null;
  const ultimas: Record<string, string> = alunoId ? await ultimaExecucaoPorDia(alunoId, programa?.dias.map((d) => d.id) ?? []) : {};
  const recentes = alunoId ? await listarExecucoes(alunoId, 5) : [];
  const historico = alunoId ? await listarExecucoes(alunoId, 200) : [];
  const limitacoes = alunoId ? await listarLimitacoes(alunoId) : [];
  const consistencia = resumirConsistencia(historico.map((e) => e.concluido_em!), programa?.dias.length ?? 1);
  // Sugestão simples: o dia menos recente (ou o primeiro nunca feito)
  const sugerido = programa?.dias.length
    ? [...programa.dias].sort((a, b) => (ultimas[a.id] ?? "").localeCompare(ultimas[b.id] ?? ""))[0]
    : null;

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bora, {usuario.nome?.split(" ")[0] ?? "aluno"}!</h1>
        <form action={sair}><Button variant="ghost" size="sm">Sair</Button></form>
      </header>
      <div className="mt-3"><NavAluno atual="/aluno" /></div>

      {!alunoId || !personal ? (
        <p className="mt-6 text-neutral-600">Sua conta ainda não está ligada a um personal. Abra o link de convite de novo.</p>
      ) : !programa ? (
        <p className="mt-6 rounded-lg border border-dashed p-4 text-neutral-600">{personal.nome} ainda não montou seu programa. Assim que ele publicar, seu treino aparece aqui.</p>
      ) : (
        <>
          <section className="mt-5">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Programa atual</p>
            <h2 className="text-lg font-medium">{programa.nome}</h2>
            {programa.observacao && <p className="text-sm text-neutral-600">{programa.observacao}</p>}
          </section>
          <ul className="mt-3 grid gap-2">
            {programa.dias.map((d) => {
              const ehSugerido = d.id === sugerido?.id;
              return (
                <li key={d.id} className={`rounded-xl border p-4 ${ehSugerido ? "border-neutral-900" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{d.nome} {ehSugerido && <span className="ml-1 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">sugestão de hoje</span>}</p>
                      <p className="text-sm text-neutral-500">{d.exercicios.length} exercícios · último: {rotuloRelativo(ultimas[d.id])}</p>
                    </div>
                    <Link href={`/aluno/treino/${d.id}`} className={buttonVariants({ size: ehSugerido ? "default" : "sm", variant: ehSugerido ? "default" : "outline" })}>Treinar</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {alunoId && personal && limitacoes.length === 0 && (
        <Link href="/aluno/perfil" className="mt-4 block rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Sente dor ou tem alguma restrição (joelho, ombro, lombar...)? <span className="underline">Conte aqui</span> para {personal.nome.split(" ")[0]} adaptar seu treino.
        </Link>
      )}

      {alunoId && programa && (
        <section className="mt-6 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Esta semana</p>
              <p className="text-2xl font-semibold">{consistencia.treinosEstaSemana}<span className="text-base font-normal text-neutral-500">/{consistencia.metaSemanal} treinos</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Sequência</p>
              <p className="text-2xl font-semibold">🔥 {consistencia.semanasSeguidas}<span className="text-base font-normal text-neutral-500"> {consistencia.semanasSeguidas === 1 ? "semana" : "semanas"}</span></p>
            </div>
          </div>
          <div className="mt-3"><CalendarioPresenca diasTreinados={consistencia.diasTreinados} /></div>
          <p className="mt-2 text-xs text-neutral-500">{consistencia.treinosEstaSemana >= consistencia.metaSemanal ? "Meta da semana batida. Não quebre a corrente!" : `Faltam ${consistencia.metaSemanal - consistencia.treinosEstaSemana} para fechar a semana.`}</p>
        </section>
      )}

      {recentes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between"><h3 className="font-medium">Últimos treinos</h3><Link href="/aluno/historico" className="text-sm underline">ver todos</Link></div>
          <ul className="mt-2 divide-y rounded-lg border text-sm">
            {recentes.map((e) => (
              <li key={e.id}><Link href={`/aluno/historico/${e.id}`} className="flex justify-between p-3 hover:bg-neutral-50"><span>{e.nome_dia}</span><span className="text-neutral-500">{rotuloRelativo(e.concluido_em)}</span></Link></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
