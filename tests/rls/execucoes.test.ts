/** Execuções: aluno registra e lê as próprias; personal do aluno lê; outro aluno e outro personal não; personal não escreve. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OPCOES_DB, type SCHEMA } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any, "public", typeof SCHEMA>;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rodar = Boolean(url && chave && service && !url.includes("localhost:54321")) ? describe : describe.skip;

rodar("RLS · execuções", () => {
  let admin: Cliente, personalX: Cliente, personalY: Cliente, alunoA: Cliente, alunoB: Cliente;
  const criados: string[] = []; let exId: string, alunoAId: string, alunoBId: string, execId: string;

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
    const tenantX = (await admin.from("personals").select("id").eq("profile_id", x.id).single()).data!.id;
    const al = await admin.from("alunos").insert([{ personal_id: tenantX, nome: "A", status: "ativo", profile_id: a.id }, { personal_id: tenantX, nome: "B", status: "ativo", profile_id: b.id }]).select("id");
    alunoAId = al.data![0].id; alunoBId = al.data![1].id;
    exId = (await admin.from("exercicios").insert({ personal_id: null, slug: "rls-exec-" + crypto.randomUUID(), nome: "Ex", grupo_muscular: "Peito", origem: "seed" }).select("id").single()).data!.id;
  });
  afterAll(async () => {
    await admin.from("exercicios").delete().eq("id", exId);
    for (const id of criados) await admin.auth.admin.deleteUser(id);
  });

  it("aluno A registra treino + séries; não consegue registrar em nome de B", async () => {
    const e = await alunoA.from("execucoes").insert({ aluno_id: alunoAId, nome_dia: "A", concluido_em: new Date().toISOString() }).select("id").single();
    expect(e.error).toBeNull(); execId = e.data!.id;
    const s = await alunoA.from("execucao_series").insert({ execucao_id: execId, exercicio_id: exId, nome_exercicio: "Ex", serie: 1, repeticoes: 10, carga: 20 });
    expect(s.error).toBeNull();
    const fake = await alunoA.from("execucoes").insert({ aluno_id: alunoBId, nome_dia: "hack" });
    expect(fake.error).not.toBeNull();
  });

  it("personal X (dono) lê; personal Y e aluno B não; personal não escreve", async () => {
    expect((await personalX.from("execucoes").select("id").eq("id", execId)).data).toHaveLength(1);
    expect((await personalX.from("execucao_series").select("id").eq("execucao_id", execId)).data).toHaveLength(1);
    expect((await personalY.from("execucoes").select("id").eq("id", execId)).data).toEqual([]);
    expect((await alunoB.from("execucoes").select("id").eq("id", execId)).data).toEqual([]);
    expect((await alunoB.from("execucao_series").select("id").eq("execucao_id", execId)).data).toEqual([]);
    expect((await personalX.from("execucoes").update({ rpe: 9 }).eq("id", execId).select("id")).data).toEqual([]);
  });
});
