import Link from "next/link";

const ITENS = [
  { href: "/aluno", rotulo: "Treino" },
  { href: "/aluno/historico", rotulo: "Histórico" },
  { href: "/aluno/evolucao", rotulo: "Evolução" },
  { href: "/aluno/perfil", rotulo: "Meu corpo" },
];

export function NavAluno({ atual }: { atual: string }) {
  return (
    <nav className="flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm">
      {ITENS.map((i) => (
        <Link key={i.href} href={i.href} className={`flex-1 rounded-md px-3 py-1.5 text-center ${atual === i.href ? "bg-white font-medium shadow-sm" : "text-neutral-600"}`}>{i.rotulo}</Link>
      ))}
    </nav>
  );
}
