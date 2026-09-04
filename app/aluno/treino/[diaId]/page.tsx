import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { programaAtivoDoAluno } from "@/lib/dal/programas";
import { meuAlunoId, ultimasSeries } from "@/lib/dal/execucoes";
import { FormularioTreino } from "./formulario-treino";

export default async function PaginaTreino({ params }: { params: Promise<{ diaId: string }> }) {
  await exigirUsuario("aluno");
  const { diaId } = await params;
  const alunoId = await meuAlunoId();
  const programa = alunoId ? await programaAtivoDoAluno(alunoId) : null;
  const dia = programa?.dias.find((d) => d.id === diaId);
  if (!alunoId || !programa || !dia) notFound();
  const anteriores = await ultimasSeries(alunoId, dia.exercicios.map((x) => x.id));

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <Link href="/aluno" className="text-sm text-neutral-500 hover:underline">← Início</Link>
      <h1 className="text-xl font-semibold">{dia.nome}</h1>
      <p className="text-sm text-neutral-500">{programa.nome}{dia.observacao ? ` · ${dia.observacao}` : ""}</p>
      <FormularioTreino
        diaId={dia.id}
        nomeDia={dia.nome}
        itens={dia.exercicios.map((x) => ({
          id: x.id, exercicioId: x.exercicio_id, nome: x.exercicio.nome, imagem: x.exercicio.imagens[0] ?? null, video: x.exercicio.video_url,
          series: x.series, repeticoes: x.repeticoes, carga: x.carga, descanso: x.descanso_seg, observacao: x.observacao, instrucoes: x.exercicio.instrucoes,
          anteriores: anteriores[x.id] ?? [],
        }))}
      />
    </main>
  );
}
