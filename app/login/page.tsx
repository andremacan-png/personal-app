import { FormularioLogin } from "./formulario";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string; modo?: string }>;
}) {
  const { proximo, modo } = await searchParams;
  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-50 p-4">
      <FormularioLogin proximo={proximo ?? "/"} modoInicial={modo === "cadastro" ? "cadastro" : "entrar"} />
    </main>
  );
}
