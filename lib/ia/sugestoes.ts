import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Exercicio } from "@/lib/dal/exercicios";
import { ROTULO_REGIAO } from "@/lib/limitacoes";

export type Sugestao = { exercicio_id: string; motivo: string };

export function iaDisponivel(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Decisão #9: a IA SUGERE, o personal aprova. Recebe o exercício a trocar, as limitações do aluno e
 * candidatos já filtrados pelas regras (mesmo grupo, sem conflito) e devolve até 3 com justificativa curta.
 */
export async function sugerirAlternativas(d: { original: Exercicio; limitacoes: string[]; candidatos: Exercicio[]; observacao?: string | null }): Promise<Sugestao[]> {
  if (!iaDisponivel() || d.candidatos.length === 0) return [];
  const client = new Anthropic();
  const lista = d.candidatos.slice(0, 40).map((c) => ({ id: c.id, nome: c.nome, equipamento: c.equipamento, mecanica: c.mecanica, nivel: c.nivel, contraindicacoes: c.contraindicacoes }));
  const resp = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 2000,
    output_config: { effort: "medium" },
    system: `Você apoia um personal trainer brasileiro. Ele vai trocar um exercício do programa de um aluno por causa de limitações físicas. Escolha até 3 alternativas da lista de candidatos (já filtrados: mesmo grupo muscular e sem contraindicação para as limitações) que preservem o objetivo do exercício original, priorizando equipamento parecido e menor risco. Justifique em UMA frase curta, em português, falando com o personal. Responda SOMENTE com JSON: [{"exercicio_id": "...", "motivo": "..."}].`,
    messages: [{ role: "user", content: JSON.stringify({
      original: { nome: d.original.nome, grupo: d.original.grupo_muscular, equipamento: d.original.equipamento, mecanica: d.original.mecanica, contraindicacoes: d.original.contraindicacoes },
      limitacoes_do_aluno: d.limitacoes.map((l) => ROTULO_REGIAO[l] ?? l),
      observacao_do_aluno: d.observacao ?? null,
      candidatos: lista,
    }) }],
  });
  if (resp.stop_reason === "refusal") return [];
  const texto = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const arr = JSON.parse(texto.slice(texto.indexOf("["), texto.lastIndexOf("]") + 1)) as Sugestao[];
    const ids = new Set(d.candidatos.map((c) => c.id));
    return arr.filter((s) => s && ids.has(s.exercicio_id) && typeof s.motivo === "string").slice(0, 3);
  } catch { return []; }
}
