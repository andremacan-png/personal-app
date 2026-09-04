/** Vocabulário fixo de regiões/condições e a regra pura de conflito exercício × aluno. */
export const REGIOES = [
  ["joelho", "Joelho"], ["ombro", "Ombro"], ["lombar", "Lombar"], ["quadril", "Quadril"], ["cervical", "Cervical / pescoço"],
  ["punho", "Punho / mão"], ["cotovelo", "Cotovelo"], ["tornozelo", "Tornozelo / pé"], ["gestante", "Gestante"],
  ["hipertensao", "Hipertensão"], ["cardiaco", "Cardíaco"], ["outro", "Outro"],
] as const;
export type Regiao = (typeof REGIOES)[number][0];
export const ROTULO_REGIAO: Record<string, string> = Object.fromEntries(REGIOES);

/** Regiões do aluno que batem com as contraindicações do exercício (ambas em minúsculas, sem acento). */
export function conflitos(contraindicacoes: string[], limitacoesAtivas: string[]): string[] {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const lim = new Set(limitacoesAtivas.map(norm));
  return contraindicacoes.map(norm).filter((c) => lim.has(c));
}
