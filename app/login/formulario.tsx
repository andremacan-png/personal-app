"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { entrar, cadastrarPersonal } from "./actions";

export function FormularioLogin({ proximo, modoInicial }: { proximo: string; modoInicial: "entrar" | "cadastro" }) {
  const [modo, setModo] = useState(modoInicial);
  const [estadoEntrar, acaoEntrar, entrando] = useActionState(entrar, undefined);
  const [estadoCadastro, acaoCadastro, cadastrando] = useActionState(cadastrarPersonal, undefined);
  const cadastro = modo === "cadastro";
  const erro = cadastro ? estadoCadastro?.erro : estadoEntrar?.erro;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle><h1>{cadastro ? "Criar conta de personal" : "Entrar"}</h1></CardTitle>
        <CardDescription>
          {cadastro ? "Alunos entram pelo link de convite do personal." : "APP Personal"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={cadastro ? acaoCadastro : acaoEntrar} className="grid gap-4">
          <input type="hidden" name="proximo" value={proximo} />
          {cadastro && (
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" autoComplete="name" required />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" name="senha" type="password" autoComplete={cadastro ? "new-password" : "current-password"} minLength={8} required />
          </div>
          {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
          <Button type="submit" disabled={entrando || cadastrando} className="w-full">
            {cadastro ? "Criar conta" : "Entrar"}
          </Button>
          <button type="button" onClick={() => setModo(cadastro ? "entrar" : "cadastro")} className="text-sm text-neutral-600 underline-offset-4 hover:underline">
            {cadastro ? "Já tenho conta" : "Sou personal e quero criar conta"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
