import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { FormularioExercicio } from "@/components/formulario-exercicio";
import { criarExercicioAction } from "../actions";

export default async function PaginaNovoExercicio() {
  await exigirUsuario("personal");
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/personal/exercicios" className="text-sm text-neutral-500 hover:underline">← Exercícios</Link>
      <h1 className="text-2xl font-semibold">Novo exercício</h1>
      <FormularioExercicio acao={criarExercicioAction} />
    </main>
  );
}
