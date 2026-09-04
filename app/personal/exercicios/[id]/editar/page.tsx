import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterExercicio } from "@/lib/dal/exercicios";
import { FormularioExercicio } from "@/components/formulario-exercicio";
import { atualizarExercicioAction } from "../../actions";

export default async function PaginaEditarExercicio({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario("personal");
  const { id } = await params;
  const e = await obterExercicio(id);
  if (!e) notFound();
  if (!e.personal_id) redirect(`/personal/exercicios/${id}`);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/personal/exercicios/${id}`} className="text-sm text-neutral-500 hover:underline">← {e.nome}</Link>
      <h1 className="text-2xl font-semibold">Editar exercício</h1>
      <FormularioExercicio acao={atualizarExercicioAction} inicial={e} />
    </main>
  );
}
