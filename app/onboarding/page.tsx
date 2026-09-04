import { exigirUsuario } from "@/lib/auth/dal";

export default async function Onboarding() {
  const usuario = await exigirUsuario();
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Quase lá</h1>
      <p className="mt-2 text-neutral-600">
        Sua conta ({usuario.email}) ainda não tem papel definido. Se você é aluno, use o link de convite do seu personal.
      </p>
    </main>
  );
}
