import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { obterExercicio, ROTULO_CATEGORIA } from "@/lib/dal/exercicios";
import { Button, buttonVariants } from "@/components/ui/button";
import { arquivarExercicioAction, duplicarExercicioAction } from "../actions";

export default async function PaginaExercicio({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario("personal");
  const { id } = await params;
  const e = await obterExercicio(id);
  if (!e) notFound();
  const meu = Boolean(e.personal_id);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/personal/exercicios" className="text-sm text-neutral-500 hover:underline">← Exercícios</Link>
      <header className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{e.nome}</h1>
          <p className="text-sm text-neutral-500">{e.grupo_muscular}{e.equipamento ? ` · ${e.equipamento}` : ""} · {ROTULO_CATEGORIA[e.categoria]}{e.nivel ? ` · ${e.nivel}` : ""}</p>
          {e.nome_en && e.nome_en !== e.nome && <p className="text-xs text-neutral-400">{e.nome_en}</p>}
        </div>
        <div className="flex gap-2">
          {meu ? (
            <>
              <Link href={`/personal/exercicios/${e.id}/editar`} className={buttonVariants({ size: "sm" })}>Editar</Link>
              <form action={arquivarExercicioAction}><input type="hidden" name="id" value={e.id} /><Button variant="outline" size="sm" type="submit">Arquivar</Button></form>
            </>
          ) : (
            <form action={duplicarExercicioAction}><input type="hidden" name="id" value={e.id} /><Button size="sm" type="submit">Duplicar e editar</Button></form>
          )}
        </div>
      </header>
      {e.imagens.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {e.imagens.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={e.nome} className="h-48 rounded-lg bg-neutral-100 object-cover" />
          ))}
        </div>
      )}
      {e.video_url && <p className="mt-3"><a href={e.video_url} target="_blank" rel="noopener" className="text-sm underline">Ver vídeo</a></p>}
      {e.instrucoes.length > 0 && (
        <section className="mt-6"><h2 className="font-medium">Como executar</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-700">{e.instrucoes.map((i, n) => <li key={n}>{i}</li>)}</ol></section>
      )}
      {e.musculos_secundarios.length > 0 && <p className="mt-4 text-sm text-neutral-500">Também trabalha: {e.musculos_secundarios.join(", ")}</p>}
      {e.contraindicacoes.length > 0 && <p className="mt-2 text-sm text-amber-700">Cuidado com: {e.contraindicacoes.join(", ")}</p>}
    </main>
  );
}
