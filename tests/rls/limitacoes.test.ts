/** Limitações: personal gerencia as do seu tenant; aluno lê as suas e informa as próprias (criado_por=aluno); Y não vê. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OPCOES_DB, type SCHEMA } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any, "public", typeof SCHEMA>;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rodar = Boolean(url && chave && service && !url.includes("localhost:54321")) ? describe : describe.skip;

rodar("RLS · limitações", () => {
  let admin: Cliente, personalX: Cliente, personalY: Cliente, alunoA: Cliente;
  const criados: string[] = []; let alunoAId: string, limId: string;

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
    const x = await usuario("personal", "X"), y = await usuario("personal", "Y"), a = await usuario("aluno", "A");
    personalX = x.cliente; personalY = y.cliente; alunoA = a.cliente;
    const tenantX = (await admin.from("personals").select("id").eq("profile_id", x.id).single()).data!.id;
    alunoAId = (await admin.from("alunos").insert({ personal_id: tenantX, nome: "A", status: "ativo", profile_id: a.id }).select("id").single()).data!.id;
  });
  afterAll(async () => { for (const id of criados) await admin.auth.admin.deleteUser(id); });

  it("personal X cadastra; aluno lê; Y não vê", async () => {
    const r = await personalX.from("aluno_limitacoes").insert({ aluno_id: alunoAId, regiao: "joelho", descricao: "dor" }).select("id").single();
    expect(r.error).toBeNull(); limId = r.data!.id;
    expect((await alunoA.from("aluno_limitacoes").select("id").eq("id", limId)).data).toHaveLength(1);
    expect((await personalY.from("aluno_limitacoes").select("id").eq("id", limId)).data).toEqual([]);
  });
  it("aluno informa a própria (criado_por=aluno) mas não pode se passar pelo personal nem editar a do personal", async () => {
    expect((await alunoA.from("aluno_limitacoes").insert({ aluno_id: alunoAId, regiao: "ombro", criado_por: "aluno" })).error).toBeNull();
    expect((await alunoA.from("aluno_limitacoes").insert({ aluno_id: alunoAId, regiao: "ombro", criado_por: "personal" })).error).not.toBeNull();
    expect((await alunoA.from("aluno_limitacoes").update({ ativa: false }).eq("id", limId).select("id")).data).toEqual([]);
  });
});
