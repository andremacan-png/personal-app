/** Provisório (04/09/2026): as tabelas vivem no schema "personal" dentro do projeto Supabase compartilhado. */
export const SCHEMA = "personal" as const;
export const OPCOES_DB = { db: { schema: SCHEMA } } as const;
