// Cria (ou garante) o personal de teste do e2e. Lê .env.test.local; nunca imprime chaves.
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.E2E_PERSONAL_EMAIL ?? "e2e-personal@teste.local";
const senha = process.env.E2E_PERSONAL_SENHA ?? "e2e-senha-de-teste-123";
if (!url || !service) { console.error("faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const admin = createClient(url, service, { db: { schema: "personal" }, auth: { persistSession: false } });
const { data: lista } = await admin.auth.admin.listUsers({ perPage: 1000 });
const existente = lista?.users.find((u) => u.email === email);
if (existente) {
  await admin.auth.admin.updateUserById(existente.id, { password: senha });
  console.log("personal e2e já existia, senha garantida");
} else {
  const { error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true, user_metadata: { papel: "personal", nome: "Personal E2E" } });
  if (error) { console.error(error.message); process.exit(1); }
  console.log("personal e2e criado");
}
