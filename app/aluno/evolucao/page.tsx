import { exigirUsuario } from "@/lib/auth/dal";
import { evolucaoPorExercicio, meuAlunoId } from "@/lib/dal/execucoes";
import { NavAluno } from "@/components/nav-aluno";
import { GraficoEvolucao } from "@/components/grafico-evolucao";

export default async function PaginaEvolucao() {
  await exigirUsuario("aluno");
  const alunoId = await meuAlunoId();
  const dados = alunoId ? await evolucaoPorExercicio(alunoId) : [];
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Evolução</h1>
      <div className="mt-3"><NavAluno atual="/aluno/evolucao" /></div>
      <div className="mt-4 rounded-xl border p-3">
        {dados.length === 0 ? <p className="text-sm text-neutral-500">Conclua alguns treinos registrando a carga e seus gráficos aparecem aqui.</p> : <GraficoEvolucao dados={dados} />}
      </div>
    </main>
  );
}
