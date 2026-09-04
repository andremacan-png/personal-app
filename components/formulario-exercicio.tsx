"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Exercicio } from "@/lib/dal/exercicios";
import type { EstadoExercicio } from "@/app/personal/exercicios/actions";

const GRUPOS = ["Peito", "Costas (meio)", "Dorsais", "Lombar", "Ombros", "Trapézio", "Bíceps", "Tríceps", "Antebraço", "Abdômen", "Quadríceps", "Posterior de coxa", "Glúteos", "Adutores", "Abdutores", "Panturrilha", "Pescoço", "Corpo inteiro"];
const CATEGORIAS = [["forca", "Força"], ["cardio", "Cardio"], ["alongamento", "Alongamento"], ["mobilidade", "Mobilidade"], ["pliometria", "Pliometria"], ["levantamento", "LPO"], ["strongman", "Strongman"]];

export function FormularioExercicio({ acao, inicial }: { acao: (s: EstadoExercicio, f: FormData) => Promise<EstadoExercicio>; inicial?: Exercicio }) {
  const [estado, dispatch, pendente] = useActionState(acao, undefined);
  const cls = "h-9 w-full rounded-md border bg-white px-2 text-sm";
  return (
    <form action={dispatch} className="mt-6 grid gap-4">
      {inicial && <input type="hidden" name="id" value={inicial.id} />}
      <div className="grid gap-2"><Label htmlFor="nome">Nome</Label><Input id="nome" name="nome" defaultValue={inicial?.nome} required autoFocus /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2"><Label htmlFor="grupo_muscular">Grupo muscular</Label>
          <select id="grupo_muscular" name="grupo_muscular" defaultValue={inicial?.grupo_muscular ?? "Peito"} className={cls}>{GRUPOS.map((g) => <option key={g}>{g}</option>)}</select></div>
        <div className="grid gap-2"><Label htmlFor="categoria">Tipo</Label>
          <select id="categoria" name="categoria" defaultValue={inicial?.categoria ?? "forca"} className={cls}>{CATEGORIAS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}</select></div>
        <div className="grid gap-2"><Label htmlFor="equipamento">Equipamento</Label><Input id="equipamento" name="equipamento" defaultValue={inicial?.equipamento ?? ""} placeholder="Halteres, Barra, Máquina..." /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="instrucoes">Como executar (um passo por linha)</Label>
        <textarea id="instrucoes" name="instrucoes" rows={5} defaultValue={inicial?.instrucoes.join("\n")} className="rounded-md border bg-white p-2 text-sm" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="video_url">Vídeo (YouTube, Drive, Instagram...)</Label><Input id="video_url" name="video_url" type="url" defaultValue={inicial?.video_url ?? ""} placeholder="https://" /></div>
        <div className="grid gap-2"><Label htmlFor="imagem_url">Imagem (URL)</Label><Input id="imagem_url" name="imagem_url" type="url" defaultValue={inicial?.imagens[0] ?? ""} placeholder="https://" /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="contraindicacoes">Contraindicações (uma por linha, ex.: joelho, lombar, ombro)</Label>
        <textarea id="contraindicacoes" name="contraindicacoes" rows={2} defaultValue={inicial?.contraindicacoes.join("\n")} className="rounded-md border bg-white p-2 text-sm" /></div>
      {estado?.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
      <Button type="submit" disabled={pendente}>{inicial ? "Salvar" : "Criar exercício"}</Button>
    </form>
  );
}
