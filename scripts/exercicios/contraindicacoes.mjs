// Marca contraindicações (vocabulário fixo) nos 876 exercícios da base com a API da Anthropic, em lotes, com retomada.
// É SUGESTÃO para o personal revisar (decisão #9: IA sugere, personal aprova). Uso: node --env-file=<env com ANTHROPIC_API_KEY> scripts/exercicios/contraindicacoes.mjs
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const ORIGEM = "scripts/exercicios/free-exercise-db.json", DESTINO = "scripts/exercicios/contraindicacoes.json";
const LOTE = 30, PARALELO = 4, MODELO = "claude-opus-5";
const VOCAB = ["joelho", "ombro", "lombar", "quadril", "cervical", "punho", "cotovelo", "tornozelo", "gestante", "hipertensao"];

const todos = JSON.parse(fs.readFileSync(ORIGEM, "utf8"));
const feitas = fs.existsSync(DESTINO) ? JSON.parse(fs.readFileSync(DESTINO, "utf8")) : {};
const pendentes = todos.filter((e) => !feitas[e.id]);
console.log(`total ${todos.length} · feitos ${Object.keys(feitas).length} · pendentes ${pendentes.length}`);
const client = new Anthropic();
const SISTEMA = `Você é um fisioterapeuta esportivo. Para cada exercício de musculação, liste as regiões/condições em que ele costuma ser CONTRAINDICADO ou exigir adaptação, usando SOMENTE este vocabulário: ${VOCAB.join(", ")}.
Critério: marque quando o exercício carrega ou estressa diretamente a estrutura (ex.: agachamento profundo → joelho; levantamento terra → lombar; desenvolvimento acima da cabeça → ombro; exercícios em decúbito dorsal prolongado ou de alto impacto → gestante; isometrias pesadas e Valsalva → hipertensao). Seja seletivo: 0 a 3 itens por exercício; alongamentos leves geralmente ficam vazios.
Responda SOMENTE com JSON: [{"id": "...", "tags": ["..."]}].`;
const salvar = () => fs.writeFileSync(DESTINO, JSON.stringify(feitas, null, 1));

async function marcar(lote) {
  const entrada = lote.map((e) => ({ id: e.id, name: e.name, muscles: e.primaryMuscles, mechanic: e.mechanic, equipment: e.equipment, category: e.category }));
  const resp = await client.messages.create({ model: MODELO, max_tokens: 8000, system: SISTEMA, output_config: { effort: "medium" }, messages: [{ role: "user", content: JSON.stringify(entrada) }] });
  if (resp.stop_reason === "refusal") throw new Error("recusa");
  const texto = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const arr = JSON.parse(texto.slice(texto.indexOf("["), texto.lastIndexOf("]") + 1));
  let n = 0;
  for (const t of arr) if (t?.id && Array.isArray(t.tags)) { feitas[t.id] = t.tags.filter((x) => VOCAB.includes(x)); n++; }
  return { n, uso: resp.usage };
}
const lotes = []; for (let i = 0; i < pendentes.length; i += LOTE) lotes.push(pendentes.slice(i, i + LOTE));
let idx = 0, tin = 0, tout = 0;
async function w(k) {
  while (idx < lotes.length) {
    const meu = idx++;
    try { const { n, uso } = await marcar(lotes[meu]); tin += uso.input_tokens; tout += uso.output_tokens; salvar(); console.log(`[w${k}] lote ${meu + 1}/${lotes.length}: ${n} ok`); }
    catch (e) { console.error(`[w${k}] lote ${meu + 1} falhou: ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: PARALELO }, (_, k) => w(k)));
salvar();
console.log(`fim · ${Object.keys(feitas).length}/${todos.length} · custo aprox. US$ ${(tin * 5 / 1e6 + tout * 25 / 1e6).toFixed(2)}`);
