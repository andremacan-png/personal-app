"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aceitarConviteAction } from "./actions";

export function FormularioConvite({ token, nomeAluno, nomePersonal, logado }: { token: string; nomeAluno: string; nomePersonal: string; logado: boolean }) {
  const [estado, acao, pendente] = useActionState(aceitarConviteAction, undefined);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle><h1>Oi, {nomeAluno.split(" ")[0]}!</h1></CardTitle>
        <CardDescription>{nomePersonal} te convidou. {logado ? "Confirme para ligar este convite à sua conta." : "Crie sua senha para ver seus treinos."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={acao} className="grid gap-4">
          <input type="hidden" name="token" value={token} />
          {!logado && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="nome">Seu nome</Label>
                <Input id="nome" name="nome" defaultValue={nomeAluno} autoComplete="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required />
              </div>
            </>
          )}
          {logado && <><input type="hidden" name="nome" value={nomeAluno} /><input type="hidden" name="email" value="logado@x.io" /><input type="hidden" name="senha" value="12345678" /></>}
          {estado?.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
          <Button type="submit" disabled={pendente} className="w-full">{logado ? "Aceitar convite" : "Criar conta e entrar"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
