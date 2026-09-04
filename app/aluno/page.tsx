import { exigirUsuario } from "@/lib/auth/dal";
import { sair } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function InicioAluno() {
  const usuario = await exigirUsuario("aluno");
  return (
    <main className="mx-auto max-w-md p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bora, {usuario.nome ?? "aluno"}!</h1>
        <form action={sair}><Button variant="outline" size="sm">Sair</Button></form>
      </header>
      <p className="mt-4 text-neutral-600">Fase 1: treino de hoje aparece aqui.</p>
    </main>
  );
}
