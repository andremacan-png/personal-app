/** Programas: personal X monta; aluno do programa lê (dias e exercícios); personal Y e outro aluno não veem; aluno não edita. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OPCOES_DB, type SCHEMA } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any, "public", typeof SCHEMA>;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rodar = Boolean(url && chave && service && !url.includes("localhost:54321")) ? describe : describe.skip;

rodar("RLS · programas", () => {
  let admin: Cliente, personalX: Cliente, personalY: Cliente, alunoA: Cliente, alunoB: Cliente;
  const criados: string[] = []; let exId: string, progId: string, diaId: string, itemId: string, tenantX: string, alunoAId: string;

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
    const x = await usuario("personal", "X"), y = await usuario("personal", "Y"), a = await usuario("aluno", "A"), b = await usuario("aluno", "B");
    personalX = x.cliente; personalY = y.cliente; alunoA = a.cliente; alunoB = b.cliente;
    tenantX = (await admin.from("personals").select("id").eq("profile_id", x.id).single()).data!.id;
    const al = await admin.from("alunos").insert([{ personal_id: tenantX, nome: "A", status: "ativo", profile_id: a.id }, { personal_id: tenantX, nome: "B", status: "ativo", profile_id: b.id }]).select("id");
    alunoAId = al.data![0].id;
    exId = (await admin.from("exercicios").insert({ personal_id: null, slug: "rls-prog-" + crypto.randomUUID(), nome: "Ex", grupo_muscular: "Peito", origem: "seed" }).select("id").single()).data!.id;
  });
  afterAll(async () => {
    if (progId) await admin.from("programas").delete().eq("id", progId);
    await admin.from("exercicios").delete().eq("id", exId);
    for (const id of criados) await admin.auth.admin.deleteUser(id);
  });

  it("personal X monta programa → dia → exercício", async () => {
    const p = await personalX.from("programas").insert({ personal_id: tenantX, aluno_id: alunoAId, nome: "ABC" }).select("id").single();
    expect(p.error).toBeNull(); progId = p.data!.id;
    const d = await personalX.from("programa_dias").insert({ programa_id: progId, ordem: 1, nome: "A" }).select("id").single();
    expect(d.error).toBeNull(); diaId = d.data!.id;
    const i = await personalX.from("programa_exercicios").insert({ programa_dia_id: diaId, exercicio_id: exId, series: 3, repeticoes: "10" }).select("id").single();
    expect(i.error).toBeNull(); itemId = i.data!.id;
  });

  it("aluno A lê programa, dias e itens; aluno B e personal Y não", async () => {
    expect((await alunoA.from("programas").select("id").eq("id", progId)).data).toHaveLength(1);
    expect((await alunoA.from("programa_dias").select("id").eq("id", diaId)).data).toHaveLength(1);
    expect((await alunoA.from("programa_exercicios").select("id").eq("id", itemId)).data).toHaveLength(1);
    expect((await alunoB.from("programas").select("id").eq("id", progId)).data).toEqual([]);
    expect((await alunoB.from("programa_exercicios").select("id").eq("id", itemId)).data).toEqual([]);
    expect((await personalY.from("programas").select("id").eq("id", progId)).data).toEqual([]);
    expect((await personalY.from("programa_dias").select("id").eq("id", diaId)).data).toEqual([]);
  });

  it("aluno não edita nem cria; Y não insere dia no programa de X", async () => {
    expect((await alunoA.from("programa_exercicios").update({ series: 99 }).eq("id", itemId).select("id")).data).toEqual([]);
    expect((await alunoA.from("programa_dias").insert({ programa_id: progId, ordem: 9, nome: "hack" })).error).not.toBeNull();
    expect((await personalY.from("programa_dias").insert({ programa_id: progId, ordem: 9, nome: "hack" })).error).not.toBeNull();
    const { data } = await admin.from("programa_exercicios").select("series").eq("id", itemId).single();
    expect(data?.series).toBe(3);
  });
});
