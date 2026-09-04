"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", texto);
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={copiar}>
      {copiado ? "Copiado!" : rotulo}
    </Button>
  );
}
