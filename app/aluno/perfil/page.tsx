import { exigirUsuario } from "@/lib/auth/dal";
import { meuAlunoId } from "@/lib/dal/execucoes";
import { listarLimitacoes } from "@/lib/dal/limitacoes";
import { NavAluno } from "@/components/nav-aluno";
import { PainelLimitacoes } from "@/components/limitacoes";

export default async function PerfilAluno() {
  await exigirUsuario("aluno");
  const alunoId = await meuAlunoId();
  const lista = alunoId ? await listarLimitacoes(alunoId) : [];
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Meu corpo</h1>
      <div className="mt-3"><NavAluno atual="/aluno/perfil" /></div>
      <div className="mt-4">{alunoId ? <PainelLimitacoes alunoId={alunoId} lista={lista} papel="aluno" /> : <p className="text-neutral-500">Conta sem personal.</p>}</div>
    </main>
  );
}
