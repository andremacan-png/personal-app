import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Categoria = "forca" | "cardio" | "alongamento" | "pliometria" | "levantamento" | "strongman" | "mobilidade";
export type Exercicio = {
  id: string; personal_id: string | null; slug: string; nome: string; nome_en: string | null;
  grupo_muscular: string; musculos_secundarios: string[]; equipamento: string | null; categoria: Categoria;
  nivel: string | null; mecanica: string | null; instrucoes: string[]; imagens: string[]; video_url: string | null;
  contraindicacoes: string[]; ativo: boolean; origem: string;
};
export const CAMPOS = "id, personal_id, slug, nome, nome_en, grupo_muscular, musculos_secundarios, equipamento, categoria, nivel, mecanica, instrucoes, imagens, video_url, contraindicacoes, ativo, origem";

export const GRUPOS = ["Peito", "Costas (meio)", "Dorsais", "Lombar", "Ombros", "Trapézio", "Bíceps", "Tríceps", "Antebraço", "Abdômen", "Quadríceps", "Posterior de coxa", "Glúteos", "Adutores", "Abdutores", "Panturrilha", "Pescoço", "Corpo inteiro"];
export const ROTULO_CATEGORIA: Record<Categoria, string> = { forca: "Força", cardio: "Cardio", alongamento: "Alongamento", pliometria: "Pliometria", levantamento: "LPO", strongman: "Strongman", mobilidade: "Mobilidade" };

export type FiltroExercicios = { busca?: string; grupo?: string; origem?: "todos" | "meus" | "base"; limite?: number };

export async function listarExercicios(f: FiltroExercicios = {}): Promise<Exercicio[]> {
  const supabase = await criarClienteServidor();
  let q = supabase.from("exercicios").select(CAMPOS).eq("ativo", true).order("nome").limit(f.limite ?? 60);
  if (f.busca?.trim()) q = q.ilike("nome", `%${f.busca.trim()}%`);
  if (f.grupo) q = q.eq("grupo_muscular", f.grupo);
  if (f.origem === "meus") q = q.not("personal_id", "is", null);
  if (f.origem === "base") q = q.is("personal_id", null);
  const { data, error } = await q;
  if (error) throw new Error("Falha ao listar exercícios: " + error.message);
  return (data ?? []) as Exercicio[];
}

export async function obterExercicio(id: string): Promise<Exercicio | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("exercicios").select(CAMPOS).eq("id", id).maybeSingle();
  return (data as Exercicio | null) ?? null;
}

export async function contarExercicios(): Promise<{ base: number; meus: number }> {
  const supabase = await criarClienteServidor();
  const [b, m] = await Promise.all([
    supabase.from("exercicios").select("id", { count: "exact", head: true }).is("personal_id", null).eq("ativo", true),
    supabase.from("exercicios").select("id", { count: "exact", head: true }).not("personal_id", "is", null).eq("ativo", true),
  ]);
  return { base: b.count ?? 0, meus: m.count ?? 0 };
}

export function gerarSlug(nome: string): string {
  return nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "exercicio";
}

export type DadosExercicio = {
  nome: string; grupo_muscular: string; equipamento: string | null; categoria: Categoria;
  instrucoes: string[]; video_url: string | null; imagens: string[]; contraindicacoes: string[]; musculos_secundarios: string[];
};

export async function criarExercicio(personalId: string, d: DadosExercicio): Promise<Exercicio> {
  const supabase = await criarClienteServidor();
  const base = gerarSlug(d.nome);
  const { data, error } = await supabase
    .from("exercicios")
    .insert({ ...d, personal_id: personalId, slug: `${base}-${Date.now().toString(36)}`, origem: "personal" })
    .select(CAMPOS).single();
  if (error) throw new Error("Falha ao criar exercício: " + error.message);
  return data as Exercicio;
}

export async function atualizarExercicio(id: string, d: Partial<DadosExercicio> & { ativo?: boolean }): Promise<boolean> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("exercicios").update({ ...d, atualizado_em: new Date().toISOString() }).eq("id", id).select("id");
  if (error) throw new Error("Falha ao atualizar: " + error.message);
  return (data?.length ?? 0) > 0; // 0 linhas = RLS barrou (não é seu)
}
