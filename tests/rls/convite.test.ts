/** Convite: anon vê só nomes; só a conta de aluno certa aceita; convite não é reutilizável. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { OPCOES_DB, type SCHEMA } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any, "public", typeof SCHEMA>;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const temBanco = Boolean(url && chave && service && !url.includes("localhost:54321"));
const rodar = temBanco ? describe : describe.skip;

rodar("RLS · convite", () => {
  let admin: Cliente, anon: Cliente, personalX: Cliente, alunoA: Cliente, alunoB: Cliente;
  const criados: string[] = [];
  let token: string, alunoId: string;

  async function usuario(papel: "personal" | "aluno", nome: string) {
    const email = `rls-${crypto.randomUUID()}@teste.local`, password = "senha-de-teste-123";
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { papel, nome } });
    if (error) throw error;
    criados.push(data.user.id);
    const c = createClient(url!, chave!, { ...OPCOES_DB, auth: { persistSession: false } });
    const { error: e2 } = await c.auth.signInWithPassword({ email, password });
    if (e2) throw e2;
    return { cliente: c, id: data.user.id };
  }

  beforeAll(async () => {
    admin = createClient(url!, service!, { ...OPCOES_DB, auth: { persistSession: false } });
    anon = createClient(url!, chave!, { ...OPCOES_DB, auth: { persistSession: false } });
    const x = await usuario("personal", "Personal X");
    personalX = x.cliente;
    alunoA = (await usuario("aluno", "Aluno A")).cliente;
    alunoB = (await usuario("aluno", "Aluno B")).cliente;
    const { data: px } = await admin.from("personals").select("id").eq("profile_id", x.id).single();
    const { data: al, error } = await admin.from("alunos").insert({ personal_id: px!.id, nome: "Carla", status: "convidado" }).select("id, convite_token").single();
    if (error) throw error;
    token = al!.convite_token; alunoId = al!.id;
  });
  afterAll(async () => { for (const id of criados) await admin.auth.admin.deleteUser(id); });

  it("anon não lê a tabela, mas vê os nomes do convite", async () => {
    const { error } = await anon.from("alunos").select("id");
    expect(error).not.toBeNull();
    const { data } = await anon.rpc("info_convite", { p_token: token });
    expect(data).toEqual([{ aluno: "Carla", personal: "Personal X", disponivel: true }]);
  });

  it("token inexistente devolve vazio", async () => {
    const { data } = await anon.rpc("info_convite", { p_token: crypto.randomUUID() });
    expect(data).toEqual([]);
  });

  it("personal não pode aceitar convite (só conta de aluno)", async () => {
    const { error } = await personalX.rpc("aceitar_convite", { p_token: token });
    expect(error?.message).toContain("aluno");
  });

  it("aluno A aceita; convite fica indisponível; A passa a ver o próprio cadastro e o personal", async () => {
    const { data, error } = await alunoA.rpc("aceitar_convite", { p_token: token });
    expect(error).toBeNull();
    expect(data).toBe(alunoId);
    const { data: info } = await anon.rpc("info_convite", { p_token: token });
    expect(info?.[0].disponivel).toBe(false);
    const { data: meu } = await alunoA.from("alunos").select("id, status").single();
    expect(meu).toEqual({ id: alunoId, status: "ativo" });
    const { data: p } = await alunoA.from("personals").select("nome").single();
    expect(p?.nome).toBe("Personal X");
  });

  it("aluno B não consegue reutilizar o convite", async () => {
    const { error } = await alunoB.rpc("aceitar_convite", { p_token: token });
    expect(error?.message).toContain("já usado");
  });
});
