// Traduz nome + instruções dos 876 exercícios para pt-BR com a API da Anthropic, em lotes, com retomada.
// Uso: node --env-file=<arquivo com ANTHROPIC_API_KEY> scripts/exercicios/traduzir.mjs
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const ORIGEM = "scripts/exercicios/free-exercise-db.json";
const DESTINO = "scripts/exercicios/traducoes.json";
const LOTE = 20, PARALELO = 4, MODELO = "claude-opus-5";

const todos = JSON.parse(fs.readFileSync(ORIGEM, "utf8"));
const feitas = fs.existsSync(DESTINO) ? JSON.parse(fs.readFileSync(DESTINO, "utf8")) : {};
const pendentes = todos.filter((e) => !feitas[e.id]);
console.log(`total ${todos.length} · já traduzidos ${Object.keys(feitas).length} · pendentes ${pendentes.length}`);

const client = new Anthropic();
const SISTEMA = `Você é um educador físico brasileiro traduzindo uma base de exercícios de musculação do inglês para o português do Brasil.
Regras:
- "nome": o nome pelo qual o exercício é conhecido nas academias do Brasil (ex.: "Barbell Bench Press" → "Supino reto com barra"; "Lat Pulldown" → "Puxada alta"; "Romanian Deadlift" → "Levantamento terra romeno"). Curto, sem explicações, primeira letra maiúscula, sem ponto final.
- "instrucoes": tradução fiel de cada passo, uma frase por passo, tom direto para o aluno ("Deite no banco...", "Segure a barra...").
- Mantenha termos consagrados em inglês quando é assim que se usa no Brasil (ex.: "Kettlebell swing", "Burpee", "Hip thrust").
Responda SOMENTE com um array JSON: [{"id": "...", "nome": "...", "instrucoes": ["...", "..."]}]. Sem texto fora do JSON.`;

function salvar() { fs.writeFileSync(DESTINO, JSON.stringify(feitas, null, 1)); }

async function traduzirLote(lote) {
  const entrada = lote.map((e) => ({ id: e.id, name: e.name, instructions: e.instructions }));
  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 16000,
    system: SISTEMA,
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: JSON.stringify(entrada) }],
  });
  if (resp.stop_reason === "refusal") throw new Error("recusa: " + JSON.stringify(resp.stop_details));
  const texto = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const ini = texto.indexOf("["), fim = texto.lastIndexOf("]");
  const arr = JSON.parse(texto.slice(ini, fim + 1));
  let n = 0;
  for (const t of arr) {
    if (t?.id && typeof t.nome === "string" && Array.isArray(t.instrucoes)) { feitas[t.id] = { nome: t.nome.trim(), instrucoes: t.instrucoes.map(String) }; n++; }
  }
  return { n, uso: resp.usage };
}

const lotes = [];
for (let i = 0; i < pendentes.length; i += LOTE) lotes.push(pendentes.slice(i, i + LOTE));
let idx = 0, entrada = 0, saida = 0;
async function trabalhador(w) {
  while (idx < lotes.length) {
    const meu = idx++;
    try {
      const { n, uso } = await traduzirLote(lotes[meu]);
      entrada += uso.input_tokens; saida += uso.output_tokens;
      salvar();
      console.log(`[w${w}] lote ${meu + 1}/${lotes.length}: ${n} ok · tokens in ${entrada} out ${saida}`);
    } catch (e) {
      console.error(`[w${w}] lote ${meu + 1} falhou: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: PARALELO }, (_, w) => trabalhador(w)));
salvar();
console.log(`fim · traduzidos ${Object.keys(feitas).length}/${todos.length} · custo aprox. US$ ${(entrada * 5 / 1e6 + saida * 25 / 1e6).toFixed(2)}`);
