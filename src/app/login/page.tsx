import Link from "next/link";
import { login } from "./actions";

export const metadata = { title: "Entrar | Projeto Futuro" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      {/* Lado visual */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 font-bold">
              PF
            </span>
            <span className="text-lg font-bold">Projeto Futuro</span>
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">
              Sistema de Chamada de Presença
            </h1>
            <p className="mt-4 max-w-md text-white/80">
              Skate, Karatê, Violão, Balé e Futebol — gerencie alunos,
              professores e presenças com praticidade.
            </p>
          </div>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} lucianopazinato.com.br
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 lg:hidden"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">
                PF
              </span>
              <span className="text-lg font-bold text-slate-900">
                Projeto Futuro
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900">
              Acesso restrito
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {searchParams?.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}

          <form action={login} className="space-y-4">
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
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link
              href="/recuperar-senha"
              className="text-brand-700 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400">
            Acesso criado pelo administrador do Projeto Futuro.
          </p>
        </div>
      </div>
    </main>
  );
}
