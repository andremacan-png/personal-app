/** Exercícios: globais visíveis a todos; próprios só do personal; aluno vê os do seu personal; ninguém edita global. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OPCOES_DB, type SCHEMA } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any, "public", typeof SCHEMA>;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rodar = Boolean(url && chave && service && !url.includes("localhost:54321")) ? describe : describe.skip;

rodar("RLS · exercícios", () => {
  let admin: Cliente, personalX: Cliente, personalY: Cliente, alunoA: Cliente;
  const criados: string[] = []; const exIds: string[] = [];
  let tenantX: string, exX: string, exGlobal: string;

  async function usuario(papel: "personal" | "aluno", nome: string) {
    const email = `rls-${crypto.randomUUID()}@teste.local`, password = "senha-de-teste-123";
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { papel, nome } });
    if (error) throw error; criados.push(data.user.id);
    const c = createClient(url!, chave!, { ...OPCOES_DB, auth: { persistSession: false } });
    const { error: e2 } = await c.auth.signInWithPassword({ email, password }); if (e2) throw e2;
    return { cliente: c, id: data.user.id };
  }

  beforeAll(async () => {
    admin = createClient(url!, service!, { ...OPCOES_DB, auth: { persistSession: false } });
    const x = await usuario("personal", "X"); const y = await usuario("personal", "Y"); const a = await usuario("aluno", "A");
    personalX = x.cliente; personalY = y.cliente; alunoA = a.cliente;
    tenantX = (await admin.from("personals").select("id").eq("profile_id", x.id).single()).data!.id;
    await admin.from("alunos").insert({ personal_id: tenantX, nome: "A", status: "ativo", profile_id: a.id });
    const g = await admin.from("exercicios").insert({ personal_id: null, slug: "rls-global-" + crypto.randomUUID(), nome: "Global", grupo_muscular: "Peito", origem: "seed" }).select("id").single();
    exGlobal = g.data!.id; exIds.push(exGlobal);
  });
  afterAll(async () => {
    await admin.from("exercicios").delete().in("id", exIds);
    for (const id of criados) await admin.auth.admin.deleteUser(id);
  });

  it("personal X cria o próprio; Y não vê; aluno de X vê; global todos veem", async () => {
    const { data, error } = await personalX.from("exercicios").insert({ personal_id: tenantX, slug: "meu-supino", nome: "Meu supino", grupo_muscular: "Peito" }).select("id").single();
    expect(error).toBeNull(); exX = data!.id; exIds.push(exX);
    const ids = async (c: Cliente) => (await c.from("exercicios").select("id").in("id", [exX, exGlobal])).data!.map((r) => r.id).sort();
    expect(await ids(personalX)).toEqual([exX, exGlobal].sort());
    expect(await ids(personalY)).toEqual([exGlobal]);
    expect(await ids(alunoA)).toEqual([exX, exGlobal].sort());
  });

  it("ninguém edita o global; Y não edita o de X; aluno não cria", async () => {
    expect((await personalX.from("exercicios").update({ nome: "x" }).eq("id", exGlobal).select("id")).data).toEqual([]);
    expect((await personalY.from("exercicios").update({ nome: "x" }).eq("id", exX).select("id")).data).toEqual([]);
    const { error } = await alunoA.from("exercicios").insert({ personal_id: tenantX, slug: "hack", nome: "hack", grupo_muscular: "Peito" });
    expect(error).not.toBeNull();
  });

  it("personal Y não consegue criar exercício no tenant de X", async () => {
    const { error } = await personalY.from("exercicios").insert({ personal_id: tenantX, slug: "intruso", nome: "intruso", grupo_muscular: "Peito" });
    expect(error).not.toBeNull();
  });
});
