import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/dashboard/modalidades", label: "Modalidades", icon: "🏅" },
  { href: "/dashboard/alunos", label: "Alunos", icon: "🧑‍🎓" },
  { href: "/dashboard/professores", label: "Professores", icon: "🧑‍🏫" },
  { href: "/dashboard/chamada", label: "Chamada", icon: "✅" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, role")
    .eq("id", user.id)
    .single();

  const nome = perfil?.nome || user.email || "Usuário";
  const inicial = nome.charAt(0).toUpperCase();
  const isAdmin = perfil?.role === "admin";

  // Professores não gerenciam outros professores.
  const nav = isAdmin
    ? NAV
    : NAV.filter((item) => item.href !== "/dashboard/professores");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              PF
            </span>
            <span className="font-bold text-slate-900">Projeto Futuro</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden text-sm text-slate-500 hover:text-brand-700 sm:block"
            >
              Ver site ↗
            </Link>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {inicial}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium text-slate-800">{nome}</p>
                <p className="text-xs text-slate-400">
                  {perfil?.role === "admin" ? "Administrador" : "Professor"}
                </p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-500 hover:text-brand-700"
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}
