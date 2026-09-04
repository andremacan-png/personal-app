/** Conquistas derivadas dos dados (sem tabela): regra pura, testável. */
import type { Resumo } from "./streak";

export type Conquista = { id: string; titulo: string; descricao: string; emoji: string; conquistada: boolean; progresso?: string };

export function calcularConquistas(r: Resumo, recordeRecente: boolean): Conquista[] {
  const marcosTreinos = [1, 5, 10, 25, 50, 100];
  const marcosSemanas = [2, 4, 8, 12];
  const proxTreino = marcosTreinos.find((m) => r.totalTreinos < m);
  const proxSemana = marcosSemanas.find((m) => r.semanasSeguidas < m);
  const lista: Conquista[] = [
    { id: "primeiro", emoji: "🏁", titulo: "Primeiro treino", descricao: "Registrou o primeiro treino no app", conquistada: r.totalTreinos >= 1 },
    ...marcosTreinos.slice(1).map((m) => ({ id: `treinos-${m}`, emoji: m >= 50 ? "🏆" : "💪", titulo: `${m} treinos`, descricao: `Concluiu ${m} treinos`, conquistada: r.totalTreinos >= m, progresso: r.totalTreinos < m && m === proxTreino ? `${r.totalTreinos}/${m}` : undefined })),
    ...marcosSemanas.map((m) => ({ id: `semanas-${m}`, emoji: "🔥", titulo: `${m} semanas seguidas`, descricao: `Bateu a meta semanal por ${m} semanas em sequência`, conquistada: r.semanasSeguidas >= m, progresso: r.semanasSeguidas < m && m === proxSemana ? `${r.semanasSeguidas}/${m}` : undefined })),
    { id: "semana-cheia", emoji: "✅", titulo: "Semana cheia", descricao: "Bateu a meta desta semana", conquistada: r.treinosEstaSemana >= r.metaSemanal && r.metaSemanal > 0 },
    { id: "recorde", emoji: "📈", titulo: "Recorde pessoal", descricao: "Subiu a carga máxima em algum exercício nos últimos 7 dias", conquistada: recordeRecente },
  ];
  return lista;
}

/** Houve recorde nos últimos N dias? Compara a carga máx. de cada exercício antes e depois do corte. */
export function houveRecordeRecente(evolucao: { pontos: { data: string; cargaMax: number }[] }[], agora = new Date(), dias = 7): boolean {
  const corte = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - dias);
  const k = `${corte.getFullYear()}-${String(corte.getMonth() + 1).padStart(2, "0")}-${String(corte.getDate()).padStart(2, "0")}`;
  return evolucao.some((e) => {
    const antes = e.pontos.filter((p) => p.data < k), depois = e.pontos.filter((p) => p.data >= k);
    if (depois.length === 0) return false;
    const maxAntes = Math.max(0, ...antes.map((p) => p.cargaMax)), maxDepois = Math.max(...depois.map((p) => p.cargaMax));
    return antes.length > 0 && maxDepois > maxAntes;
  });
}
