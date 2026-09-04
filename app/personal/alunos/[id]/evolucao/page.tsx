import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterAluno } from "@/lib/dal/alunos";
import { evolucaoPorExercicio } from "@/lib/dal/execucoes";
import { NavPersonal } from "@/components/nav-personal";
import { GraficoEvolucao } from "@/components/grafico-evolucao";

export default async function EvolucaoDoAluno({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario("personal");
  const { id } = await params;
  const aluno = await obterAluno(id);
  if (!aluno) notFound();
  const dados = await evolucaoPorExercicio(id, 120);
  return (
    <main className="mx-auto max-w-3xl p-6">
      <NavPersonal atual="/personal/alunos" />
      <Link href={`/personal/alunos/${id}`} className="mt-4 inline-block text-sm text-neutral-500 hover:underline">← {aluno.nome}</Link>
      <h1 className="text-2xl font-semibold">Evolução de {aluno.nome.split(" ")[0]}</h1>
      <div className="mt-4 rounded-xl border p-4">
        {dados.length === 0 ? <p className="text-sm text-neutral-500">Ainda sem treinos concluídos com carga registrada.</p> : <GraficoEvolucao dados={dados} />}
      </div>
    </main>
  );
}
