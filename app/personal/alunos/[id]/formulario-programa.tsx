"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarProgramaAction } from "@/app/personal/programas/actions";

export function FormularioNovoPrograma({ alunoId, modelos }: { alunoId: string; modelos: { id: string; nome: string; aluno_nome: string }[] }) {
  const [estado, acao, pendente] = useActionState(criarProgramaAction, undefined);
  return (
    <form action={acao} className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_120px_auto] sm:items-end">
      <input type="hidden" name="aluno_id" value={alunoId} />
      <div className="grid gap-1.5"><Label htmlFor="nome">Novo programa</Label><Input id="nome" name="nome" placeholder="Ex.: Hipertrofia ABC" /></div>
      <div className="grid gap-1.5"><Label htmlFor="dias">Dias</Label>
        <select id="dias" name="dias" defaultValue="3" className="h-9 rounded-md border bg-white px-2 text-sm">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "dia" : "dias"}</option>)}
        </select></div>
      <Button type="submit" disabled={pendente}>Criar</Button>
      {modelos.length > 0 && (
        <div className="grid gap-1.5 sm:col-span-3"><Label htmlFor="copiar_de">Ou copiar de um programa existente (as cargas não vêm junto)</Label>
          <select id="copiar_de" name="copiar_de" defaultValue="" className="h-9 rounded-md border bg-white px-2 text-sm">
            <option value="">Começar do zero</option>
            {modelos.map((m) => <option key={m.id} value={m.id}>{m.nome} · {m.aluno_nome}</option>)}
          </select></div>
      )}
      {estado?.erro && <p role="alert" className="text-sm text-red-600 sm:col-span-3">{estado.erro}</p>}
      <p className="text-xs text-neutral-500 sm:col-span-3">Criar um programa novo encerra o anterior (fica no histórico).</p>
    </form>
  );
}
