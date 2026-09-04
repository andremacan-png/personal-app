import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal, obterAluno } from "@/lib/dal/alunos";
import { listarProgramasDoAluno, listarProgramasDoPersonal } from "@/lib/dal/programas";
import { listarExecucoes } from "@/lib/dal/execucoes";
import { formatarDuracao, rotuloRelativo } from "@/lib/datas";
import { resumirConsistencia } from "@/lib/streak";
import { CalendarioPresenca } from "@/components/calendario-presenca";
import { PainelLimitacoes } from "@/components/limitacoes";
import { listarLimitacoes } from "@/lib/dal/limitacoes";
import { urlBase } from "@/lib/url";
import { linkConvite, linkWhatsApp, mensagemConvite } from "@/lib/convite";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { atualizarAlunoAction } from "../actions";
import { BotaoCopiar } from "@/components/botao-copiar";
import { NavPersonal } from "@/components/nav-personal";
import { FormularioNovoPrograma } from "./formulario-programa";

const ROTULO: Record<string, string> = { convidado: "Convite pendente", ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado" };

export default async function PaginaAluno({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario("personal");
  const { id } = await params;
  const aluno = await obterAluno(id);
  if (!aluno) notFound();
  const [programas, personal, base, execucoes, limitacoes, modelos] = await Promise.all([listarProgramasDoAluno(id), meuPersonal(), urlBase(), listarExecucoes(id, 100), listarLimitacoes(id), listarProgramasDoPersonal()]);
  const consistencia = resumirConsistencia(execucoes.map((e) => e.concluido_em!), 3);
  const link = linkConvite(base, aluno.convite_token);
  const wa = linkWhatsApp(aluno.telefone, mensagemConvite(aluno.nome, personal?.nome ?? "seu personal", link));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <NavPersonal atual="/personal/alunos" />
      <Link href="/personal/alunos" className="mt-4 inline-block text-sm text-neutral-500 hover:underline">← Alunos</Link>
      <header className="mt-1">
        <h1 className="text-2xl font-semibold">{aluno.nome}</h1>
        <p className="text-sm text-neutral-500">{ROTULO[aluno.status]}{aluno.telefone ? ` · ${aluno.telefone}` : ""}</p>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-neutral-600 hover:underline">Editar dados / status</summary>
          <form action={atualizarAlunoAction} className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border p-3">
            <input type="hidden" name="id" value={aluno.id} />
            <label className="text-xs text-neutral-500">Nome<br /><Input name="nome" defaultValue={aluno.nome} className="w-56" /></label>
            <label className="text-xs text-neutral-500">WhatsApp<br /><Input name="telefone" defaultValue={aluno.telefone ?? ""} className="w-40" /></label>
            <label className="text-xs text-neutral-500">Status<br />
              <select name="status" defaultValue={aluno.status} className="h-9 rounded-md border bg-white px-2 text-sm">
                {aluno.status === "convidado" && <option value="convidado">Convite pendente</option>}
                <option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="encerrado">Encerrado</option>
              </select></label>
            <Button type="submit" size="sm">Salvar</Button>
          </form>
        </details>
      </header>

      {aluno.status === "convidado" && (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm">O aluno ainda não entrou. Mande o convite:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <BotaoCopiar texto={link} rotulo="Copiar link" />
            {wa && <a href={wa} target="_blank" rel="noopener" className={buttonVariants({ size: "sm" })}>Mandar no WhatsApp</a>}
          </div>
        </section>
      )}

      {aluno.status !== "convidado" && (
        <section className="mt-6 grid gap-4 rounded-lg border p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex gap-6">
            <div><p className="text-xs uppercase text-neutral-500">Semana</p><p className="text-2xl font-semibold">{consistencia.treinosEstaSemana}</p></div>
            <div><p className="text-xs uppercase text-neutral-500">Sequência</p><p className="text-2xl font-semibold">🔥 {consistencia.semanasSeguidas}</p></div>
            <div><p className="text-xs uppercase text-neutral-500">Total</p><p className="text-2xl font-semibold">{consistencia.totalTreinos}</p></div>
          </div>
          <div className="max-w-xs"><CalendarioPresenca diasTreinados={consistencia.diasTreinados} /></div>
        </section>
      )}

      <div className="mt-6"><PainelLimitacoes alunoId={aluno.id} lista={limitacoes} papel="personal" /></div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Programas de treino</h2>
        </div>
        {programas.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Nenhum programa ainda. Crie o primeiro abaixo.</p>
        ) : (
          <ul className="mt-2 divide-y rounded-lg border">
            {programas.map((p) => (
              <li key={p.id}>
                <Link href={`/personal/programas/${p.id}`} className="flex items-center justify-between p-3 hover:bg-neutral-50">
                  <div>
                    <p className="font-medium">{p.nome}</p>
                    <p className="text-xs text-neutral-500">desde {new Date(p.inicio).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.ativo ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"}`}>{p.ativo ? "Ativo" : "Encerrado"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <FormularioNovoPrograma alunoId={aluno.id} modelos={modelos.filter((m) => m.aluno_id !== aluno.id || !m.ativo).map((m) => ({ id: m.id, nome: m.nome, aluno_nome: m.aluno_nome }))} />
      </section>

      {execucoes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Últimos treinos</h2><Link href={`/personal/alunos/${aluno.id}/evolucao`} className="text-sm underline">ver evolução</Link></div>
          <ul className="mt-2 divide-y rounded-lg border text-sm">
            {execucoes.slice(0, 15).map((e) => (
              <li key={e.id} className="p-3">
                <div className="flex justify-between"><span className="font-medium">{e.nome_dia}</span><span className="text-neutral-500">{rotuloRelativo(e.concluido_em)}{e.duracao_seg ? ` · ${formatarDuracao(e.duracao_seg)}` : ""}{e.rpe ? ` · esforço ${e.rpe}` : ""}</span></div>
                {e.observacao && <p className="mt-1 text-amber-800">💬 {e.observacao}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
