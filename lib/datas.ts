/** Utilidades de data puras (testáveis). Datas em ISO; "hoje" injetável. */

export function diasAtras(iso: string, agora = new Date()): number {
  const d = new Date(iso);
  const a = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function rotuloRelativo(iso: string | null | undefined, agora = new Date()): string {
  if (!iso) return "nunca";
  const n = diasAtras(iso, agora);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  if (n < 7) return `há ${n} dias`;
  if (n < 14) return "há 1 semana";
  return `há ${Math.floor(n / 7)} semanas`;
}

export function formatarDuracao(seg: number | null | undefined): string {
  if (!seg || seg <= 0) return "";
  const m = Math.round(seg / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
}
