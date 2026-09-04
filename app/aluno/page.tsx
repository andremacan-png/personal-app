import { exigirUsuario } from "@/lib/auth/dal";
import { meuPersonal } from "@/lib/dal/alunos";
import { sair } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function InicioAluno() {
  const usuario = await exigirUsuario("aluno");
  const personal = await meuPersonal();
  return (
    <main className="mx-auto max-w-md p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bora, {usuario.nome?.split(" ")[0] ?? "aluno"}!</h1>
        <form action={sair}><Button variant="outline" size="sm">Sair</Button></form>
      </header>
      <p className="mt-4 text-neutral-600">
        {personal ? `Você treina com ${personal.nome}.` : "Sua conta ainda não está ligada a um personal. Abra o link de convite de novo."}
      </p>
      <p className="mt-2 text-neutral-600">Seu treino de hoje vai aparecer aqui em breve.</p>
    </main>
  );
}
