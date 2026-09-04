import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal, obterAluno } from "@/lib/dal/alunos";
import { listarProgramasDoAluno } from "@/lib/dal/programas";
import { urlBase } from "@/lib/url";
import { linkConvite, linkWhatsApp, mensagemConvite } from "@/lib/convite";
import { buttonVariants } from "@/components/ui/button";
import { BotaoCopiar } from "@/components/botao-copiar";
import { NavPersonal } from "@/components/nav-personal";
import { FormularioNovoPrograma } from "./formulario-programa";

const ROTULO: Record<string, string> = { convidado: "Convite pendente", ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado" };

export default async function PaginaAluno({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario("personal");
  const { id } = await params;
  const aluno = await obterAluno(id);
  if (!aluno) notFound();
  const [programas, personal, base] = await Promise.all([listarProgramasDoAluno(id), meuPersonal(), urlBase()]);
  const link = linkConvite(base, aluno.convite_token);
  const wa = linkWhatsApp(aluno.telefone, mensagemConvite(aluno.nome, personal?.nome ?? "seu personal", link));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <NavPersonal atual="/personal/alunos" />
      <Link href="/personal/alunos" className="mt-4 inline-block text-sm text-neutral-500 hover:underline">← Alunos</Link>
      <header className="mt-1">
        <h1 className="text-2xl font-semibold">{aluno.nome}</h1>
        <p className="text-sm text-neutral-500">{ROTULO[aluno.status]}{aluno.telefone ? ` · ${aluno.telefone}` : ""}</p>
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
        <FormularioNovoPrograma alunoId={aluno.id} />
      </section>
    </main>
  );
}
