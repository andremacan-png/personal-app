import Link from "next/link";
import { redirect } from "next/navigation";
import { obterUsuarioAtual } from "@/lib/auth/dal";
import { rotaInicial } from "@/lib/auth/rotas";
import { buttonVariants } from "@/components/ui/button";

export default async function Raiz() {
  const usuario = await obterUsuarioAtual();
  if (usuario) redirect(rotaInicial(usuario.papel));

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="font-semibold">APP Personal</span>
        <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>Entrar</Link>
      </header>
      <section className="mt-16 sm:mt-24">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Monte o treino em minutos.<br />Adapte em segundos.<br />Mantenha o aluno treinando.</h1>
        <p className="mt-5 max-w-xl text-lg text-neutral-600">O app do personal que fala a língua da academia: biblioteca com 876 exercícios em português, programas por aluno, registro série a série no celular do aluno e alertas quando um exercício conflita com uma limitação dele.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login?modo=cadastro" className={buttonVariants({ size: "lg" })}>Criar conta de personal</Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>Já tenho conta</Link>
        </div>
        <p className="mt-3 text-sm text-neutral-500">Aluno? Você entra pelo link que seu personal manda no WhatsApp.</p>
      </section>
      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          ["🏋️", "Programas em minutos", "Dias A/B/C, séries, repetições, carga e descanso. Copie de outro aluno e ajuste."],
          ["⚠️", "Adaptação a limitações", "Joelho, ombro, lombar, gestante... o app avisa o conflito e sugere alternativas. Você decide."],
          ["🔥", "Aluno engajado", "Treino do dia com a carga da última vez, sequência semanal, conquistas e evolução em gráfico."],
        ].map(([e, t, d]) => (
          <div key={t} className="rounded-xl border p-5"><p className="text-2xl">{e}</p><h2 className="mt-2 font-medium">{t}</h2><p className="mt-1 text-sm text-neutral-600">{d}</p></div>
        ))}
      </section>
      <footer className="mt-auto pt-16 text-xs text-neutral-400">Piloto em andamento. Preço previsto: R$ 10 por aluno cadastrado por mês, pago pelo personal.</footer>
    </main>
  );
}
