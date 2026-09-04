import { defineConfig } from "vitest/config";
import path from "node:path";
import { config as dotenv } from "dotenv";

// Testes de RLS leem .env.test.local (projeto de homolog). Sem ele, são pulados.
dotenv({ path: ".env.test.local" });

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "chave-de-teste",
    },
  },
});
