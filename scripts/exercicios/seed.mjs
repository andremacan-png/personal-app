// Carrega os exercícios globais (personal_id null) no banco, idempotente por slug. Usa as traduções se existirem.
// Uso: node --env-file=.env.test.local scripts/exercicios/seed.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { MUSCULOS, EQUIPAMENTOS, CATEGORIAS, NIVEIS, MECANICAS, IMG_BASE } from "./mapas.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) { console.error("faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const admin = createClient(url, service, { db: { schema: "personal" }, auth: { persistSession: false } });

const base = JSON.parse(fs.readFileSync("scripts/exercicios/free-exercise-db.json", "utf8"));
const trad = fs.existsSync("scripts/exercicios/traducoes.json") ? JSON.parse(fs.readFileSync("scripts/exercicios/traducoes.json", "utf8")) : {};
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const linhas = base.map((e) => {
  const t = trad[e.id];
  return {
    personal_id: null,
    slug: "fx-" + slug(e.id),
    nome: t?.nome ?? e.name,
    nome_en: e.name,
    grupo_muscular: MUSCULOS[e.primaryMuscles[0]] ?? "Corpo inteiro",
    musculos_secundarios: [...e.primaryMuscles.slice(1), ...e.secondaryMuscles].map((m) => MUSCULOS[m] ?? m),
    equipamento: e.equipment ? (EQUIPAMENTOS[e.equipment] ?? e.equipment) : null,
    categoria: CATEGORIAS[e.category] ?? "forca",
    nivel: NIVEIS[e.level] ?? null,
    mecanica: e.mechanic ? (MECANICAS[e.mechanic] ?? null) : null,
    instrucoes: t?.instrucoes ?? e.instructions,
    imagens: e.images.map((i) => IMG_BASE + i),
    origem: "seed",
    atualizado_em: new Date().toISOString(),
  };
});

let ok = 0;
for (let i = 0; i < linhas.length; i += 100) {
  const { error, count } = await admin.from("exercicios").upsert(linhas.slice(i, i + 100), { onConflict: "slug", ignoreDuplicates: false, count: "exact" });
  if (error) { console.error("lote", i, error.message); process.exit(1); }
  ok += count ?? 0;
}
const traduzidos = linhas.filter((l) => l.nome !== l.nome_en).length;
console.log(`seed ok: ${ok} exercícios globais (${traduzidos} com nome traduzido)`);
