/** Consistência semanal (regra pura, testável). Semana começa na segunda-feira. */

export function inicioDaSemana(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // seg=0 ... dom=6
  x.setDate(x.getDate() - dow);
  return x;
}

function chaveSemana(d: Date): string {
  const s = inicioDaSemana(d);
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
}

export type Resumo = {
  metaSemanal: number;
  treinosEstaSemana: number;
  semanasSeguidas: number;     // semanas consecutivas batendo a meta (a semana atual conta se já bateu)
  diasTreinados: string[];     // datas YYYY-MM-DD (locais) com treino, últimos 28 dias
  totalTreinos: number;
};

/**
 * @param concluidos datas ISO dos treinos concluídos
 * @param metaSemanal quantos treinos por semana o programa pede (nº de dias do programa)
 */
export function resumirConsistencia(concluidos: string[], metaSemanal: number, agora = new Date()): Resumo {
  const meta = Math.max(1, metaSemanal);
  const porSemana = new Map<string, number>();
  const dias = new Set<string>();
  const limite28 = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 27);
  for (const iso of concluidos) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const k = chaveSemana(d);
    porSemana.set(k, (porSemana.get(k) ?? 0) + 1);
    if (d >= limite28) dias.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const semanaAtual = chaveSemana(agora);
  const treinosEstaSemana = porSemana.get(semanaAtual) ?? 0;

  // Conta para trás: começa na semana atual se já bateu a meta; senão começa na anterior (semana em curso não quebra a sequência).
  let semanas = 0;
  const cursor = inicioDaSemana(agora);
  if (treinosEstaSemana >= meta) semanas++;
  cursor.setDate(cursor.getDate() - 7);
  while ((porSemana.get(chaveSemana(cursor)) ?? 0) >= meta) { semanas++; cursor.setDate(cursor.getDate() - 7); }

  return { metaSemanal: meta, treinosEstaSemana, semanasSeguidas: semanas, diasTreinados: [...dias].sort(), totalTreinos: concluidos.length };
}

/** Grade de 28 dias (4 semanas, seg→dom) terminando na semana atual, para o calendário de presença. */
export function grade28(agora = new Date()): { data: string; dia: number; hoje: boolean; futuro: boolean }[] {
  const fimSemana = inicioDaSemana(agora); fimSemana.setDate(fimSemana.getDate() + 6);
  const inicio = new Date(fimSemana); inicio.setDate(inicio.getDate() - 27);
  const hojeK = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(inicio); d.setDate(inicio.getDate() + i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { data: k, dia: d.getDate(), hoje: k === hojeK, futuro: d > agora && k !== hojeK };
  });
}
