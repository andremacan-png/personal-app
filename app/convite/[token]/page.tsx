import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioConvite } from "./formulario";

export default async function PaginaConvite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await criarClienteServidor();
  const ehUuid = /^[0-9a-f-]{36}$/i.test(token);
  const { data } = ehUuid ? await supabase.rpc("info_convite", { p_token: token }) : { data: null };
  const info = (data as { aluno: string; personal: string; disponivel: boolean }[] | null)?.[0];
  const { data: sessao } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-50 p-4">
      {!info ? (
        <p className="text-center text-neutral-600">Este link de convite não existe. Peça um novo ao seu personal.</p>
      ) : !info.disponivel ? (
        <p className="text-center text-neutral-600">Este convite já foi usado. Se a conta é sua, <a className="underline" href="/login">entre aqui</a>.</p>
      ) : (
        <FormularioConvite token={token} nomeAluno={info.aluno} nomePersonal={info.personal} logado={Boolean(sessao.user)} />
      )}
    </main>
  );
}
