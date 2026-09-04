"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EvolucaoExercicio } from "@/lib/dal/execucoes";

export function GraficoEvolucao({ dados }: { dados: EvolucaoExercicio[] }) {
  const [sel, setSel] = useState(dados[0]?.exercicio_id ?? "");
  const [metrica, setMetrica] = useState<"cargaMax" | "volume">("cargaMax");
  const ex = dados.find((d) => d.exercicio_id === sel) ?? dados[0];
  if (!ex) return null;
  const pontos = ex.pontos.map((p) => ({ ...p, rotulo: new Date(p.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) }));
  const primeiro = ex.pontos[0], ultimo = ex.pontos[ex.pontos.length - 1];
  const delta = ultimo && primeiro ? ultimo[metrica] - primeiro[metrica] : 0;
  const recorde = Math.max(...ex.pontos.map((p) => p.cargaMax));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="h-9 max-w-full flex-1 rounded-md border bg-white px-2 text-sm">
          {dados.map((d) => <option key={d.exercicio_id} value={d.exercicio_id}>{d.nome} ({d.pontos.length})</option>)}
        </select>
        <div className="flex rounded-md border text-sm">
          <button type="button" onClick={() => setMetrica("cargaMax")} className={`px-3 py-1 ${metrica === "cargaMax" ? "bg-neutral-900 text-white" : ""}`}>Carga máx.</button>
          <button type="button" onClick={() => setMetrica("volume")} className={`px-3 py-1 ${metrica === "volume" ? "bg-neutral-900 text-white" : ""}`}>Volume</button>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <div><p className="text-xs text-neutral-500">Recorde</p><p className="text-xl font-semibold">{recorde} kg</p></div>
        <div><p className="text-xs text-neutral-500">Desde o 1º registro</p><p className={`text-xl font-semibold ${delta > 0 ? "text-green-700" : delta < 0 ? "text-red-700" : ""}`}>{delta > 0 ? "+" : ""}{Math.round(delta)} {metrica === "cargaMax" ? "kg" : "kg·reps"}</p></div>
        <div><p className="text-xs text-neutral-500">Treinos</p><p className="text-xl font-semibold">{ex.pontos.length}</p></div>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pontos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="rotulo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip formatter={(v) => [`${v} ${metrica === "cargaMax" ? "kg" : "kg·reps"}`, metrica === "cargaMax" ? "Carga máx." : "Volume"]} labelFormatter={(l) => `Treino de ${l}`} />
            <Line type="monotone" dataKey={metrica} stroke="#171717" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
