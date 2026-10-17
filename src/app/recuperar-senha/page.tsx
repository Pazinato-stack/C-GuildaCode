import Link from "next/link";
import { enviarRecuperacao } from "./actions";

export const metadata = { title: "Recuperar senha | Projeto Futuro" };

export default function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-bold text-white">
            PF
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Recuperar senha</h2>
          <p className="mt-1 text-sm text-slate-500">
            Informe seu e-mail e enviaremos um link para você criar uma nova
            senha.
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        {searchParams?.ok ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Se o e-mail informado estiver cadastrado, você receberá um link
              para redefinir a senha em instantes. Confira também a caixa de
              spam.
            </div>
            <Link href="/login" className="btn-secondary block w-full text-center">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form action={enviarRecuperacao} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="voce@email.com"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Enviar link de recuperação
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/login" className="hover:text-slate-600">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}
