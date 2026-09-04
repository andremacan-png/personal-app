/**
 * Prova a PAREDE: personal X não vê tenant Y; aluno A não vê aluno B.
 * Roda contra um projeto Supabase real (homolog). Sem SUPABASE_SERVICE_ROLE_KEY, é pulado.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const temBanco = Boolean(url && chave && service && !url.includes("localhost:54321"));

const rodar = temBanco ? describe : describe.skip;

rodar("RLS · fundação", () => {
  let admin: SupabaseClient;
  const criados: string[] = [];
  let personalX: SupabaseClient, personalY: SupabaseClient, alunoA: SupabaseClient;
  let tenantX: string, alunoAId: string, alunoBId: string;

  async function usuario(papel: "personal" | "aluno", nome: string) {
    const email = `rls-${crypto.randomUUID()}@teste.local`;
    const password = "senha-de-teste-123";
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { papel, nome },
    });
    if (error) throw error;
    criados.push(data.user.id);
    const cliente = createClient(url!, chave!, { auth: { persistSession: false } });
    const { error: e2 } = await cliente.auth.signInWithPassword({ email, password });
    if (e2) throw e2;
    return { cliente, id: data.user.id };
  }

  beforeAll(async () => {
    admin = createClient(url!, service!, { auth: { persistSession: false } });
    const x = await usuario("personal", "Personal X");
    const y = await usuario("personal", "Personal Y");
    const a = await usuario("aluno", "Aluno A");
    personalX = x.cliente; personalY = y.cliente; alunoA = a.cliente;

    const { data: px } = await admin.from("personals").select("id").eq("profile_id", x.id).single();
    tenantX = px!.id;
    const { data: al } = await admin.from("alunos")
      .insert([
        { personal_id: tenantX, nome: "Aluno A", profile_id: a.id, status: "ativo" },
        { personal_id: tenantX, nome: "Aluno B" },
      ]).select("id");
    alunoAId = al![0].id; alunoBId = al![1].id;
  });

  afterAll(async () => {
    for (const id of criados) await admin.auth.admin.deleteUser(id);
  });

  it("personal X lista os próprios alunos; Y não vê nenhum deles", async () => {
    const { data: deX } = await personalX.from("alunos").select("id");
    expect(deX?.map((r) => r.id).sort()).toEqual([alunoAId, alunoBId].sort());
    const { data: deY } = await personalY.from("alunos").select("id");
    expect(deY).toEqual([]);
  });

  it("personal Y NÃO consegue editar aluno de X (0 linhas, sem erro: por isso conferimos o retorno)", async () => {
    const { data, error } = await personalY.from("alunos").update({ nome: "hack" }).eq("id", alunoAId).select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
    const { data: intacto } = await admin.from("alunos").select("nome").eq("id", alunoAId).single();
    expect(intacto?.nome).toBe("Aluno A");
  });

  it("personal Y NÃO consegue inserir aluno no tenant de X", async () => {
    const { error } = await personalY.from("alunos").insert({ personal_id: tenantX, nome: "intruso" });
    expect(error).not.toBeNull();
  });

  it("aluno A vê só a si mesmo e não edita o próprio cadastro", async () => {
    const { data } = await alunoA.from("alunos").select("id");
    expect(data?.map((r) => r.id)).toEqual([alunoAId]);
    const { data: upd } = await alunoA.from("alunos").update({ status: "ativo" }).eq("id", alunoBId).select("id");
    expect(upd).toEqual([]);
  });

  it("aluno não consegue se promover a personal", async () => {
    const { data } = await alunoA.from("profiles").update({ papel: "personal" }).eq("id", (await alunoA.auth.getUser()).data.user!.id).select("papel");
    expect(data).toEqual([]);
  });
});
