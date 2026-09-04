import Link from "next/link";

const ITENS = [
  { href: "/personal", rotulo: "Início" },
  { href: "/personal/alunos", rotulo: "Alunos" },
  { href: "/personal/exercicios", rotulo: "Exercícios" },
];

export function NavPersonal({ atual }: { atual: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-1 text-sm">
      {ITENS.map((i) => (
        <Link key={i.href} href={i.href} className={`rounded-md px-3 py-1.5 whitespace-nowrap ${atual === i.href ? "bg-white font-medium shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
