import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { listarAlunos, meuPersonal } from "@/lib/dal/alunos";
import { urlBase } from "@/lib/url";
import { linkConvite, linkWhatsApp, mensagemConvite } from "@/lib/convite";
import { buttonVariants } from "@/components/ui/button";
import { BotaoCopiar } from "@/components/botao-copiar";
import { NavPersonal } from "@/components/nav-personal";
import { execucoesDoTenant } from "@/lib/dal/execucoes";
import { rotuloRelativo } from "@/lib/datas";

const ROTULO: Record<string, string> = { convidado: "Convite pendente", ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado" };

export default async function PaginaAlunos({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  await exigirUsuario("personal");
  const [{ novo }, alunos, personal, base, execs] = await Promise.all([searchParams, listarAlunos(), meuPersonal(), urlBase(), execucoesDoTenant(60)]);
  const ultimo = new Map<string, string>();
  for (const e of execs) if (e.concluido_em && !ultimo.has(e.aluno_id)) ultimo.set(e.aluno_id, e.concluido_em);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <NavPersonal atual="/personal/alunos" />
      <header className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Alunos</h1>
        <Link href="/personal/alunos/novo" className={buttonVariants()}>Novo aluno</Link>
      </header>

      {alunos.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-6 text-center text-neutral-600">
          Nenhum aluno ainda. Cadastre o primeiro e mande o link de convite pelo WhatsApp.
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {alunos.map((a) => {
            const link = linkConvite(base, a.convite_token);
            const wa = linkWhatsApp(a.telefone, mensagemConvite(a.nome, personal?.nome ?? "seu personal", link));
            const destaque = a.id === novo;
            return (
              <li key={a.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${destaque ? "bg-amber-50" : ""}`}>
                <div>
                  <Link href={`/personal/alunos/${a.id}`} className="font-medium hover:underline">{a.nome}</Link>
                  <p className="text-sm text-neutral-500">{ROTULO[a.status] ?? a.status}{a.telefone ? ` · ${a.telefone}` : ""}{a.status === "ativo" ? ` · último treino: ${rotuloRelativo(ultimo.get(a.id))}` : ""}</p>
                </div>
                {a.status === "convidado" && (
                  <div className="flex flex-wrap gap-2">
                    <BotaoCopiar texto={link} rotulo="Copiar link" />
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener" className={buttonVariants({ size: "sm" })}>Mandar no WhatsApp</a>
                    ) : (
                      <span className="self-center text-xs text-neutral-500">Sem telefone válido para WhatsApp</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
