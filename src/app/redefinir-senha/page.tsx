import Link from "next/link";
import { definirNovaSenha } from "./actions";

export const metadata = { title: "Definir nova senha | Projeto Futuro" };

export default function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-bold text-white">
            PF
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Defina sua nova senha
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma nova senha para acessar o sistema.
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <form action={definirNovaSenha} className="space-y-4">
          <div>
            <label htmlFor="nova_senha" className="label">
              Nova senha
            </label>
            <input
              id="nova_senha"
              name="nova_senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmar_senha" className="label">
              Confirmar nova senha
            </label>
            <input
              id="confirmar_senha"
              name="confirmar_senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Salvar nova senha
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/login" className="hover:text-slate-600">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}
