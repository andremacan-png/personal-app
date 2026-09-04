"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarAlunoAction } from "../actions";

export function FormularioNovoAluno() {
  const [estado, acao, pendente] = useActionState(criarAlunoAction, undefined);
  return (
    <form action={acao} className="mt-6 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" autoComplete="off" required autoFocus />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="telefone">WhatsApp (com DDD)</Label>
        <Input id="telefone" name="telefone" type="tel" inputMode="tel" placeholder="48 99999-1234" />
      </div>
      {estado?.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
      <Button type="submit" disabled={pendente}>Cadastrar e gerar convite</Button>
    </form>
  );
}
