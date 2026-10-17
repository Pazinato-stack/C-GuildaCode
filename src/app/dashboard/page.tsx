import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const supabase = await createClient();

  const [alunos, professores, modalidades, chamadasHoje] = await Promise.all([
    supabase.from("alunos").select("id", { count: "exact", head: true }),
    supabase.from("professores").select("id", { count: "exact", head: true }),
    supabase.from("modalidades").select("id", { count: "exact", head: true }),
    supabase
      .from("chamadas")
      .select("id", { count: "exact", head: true })
      .eq("data", new Date().toISOString().slice(0, 10)),
  ]);

  const stats = [
    { label: "Alunos", value: alunos.count ?? 0, icon: "🧑‍🎓", href: "/dashboard/alunos" },
    { label: "Professores", value: professores.count ?? 0, icon: "🧑‍🏫", href: "/dashboard/professores" },
    { label: "Modalidades", value: modalidades.count ?? 0, icon: "🏅", href: "/dashboard/modalidades" },
    { label: "Chamadas hoje", value: chamadasHoje.count ?? 0, icon: "✅", href: "/dashboard/chamada" },
  ];

  const { data: mods } = await supabase
    .from("modalidades")
    .select("id, nome")
    .order("id");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral do Projeto Futuro.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden>{s.icon}</span>
              <span className="text-3xl font-extrabold text-slate-900">{s.value}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Ações rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/chamada" className="btn-primary">Fazer chamada</Link>
          <Link href="/dashboard/alunos" className="btn-secondary">Cadastrar aluno</Link>
          <Link href="/dashboard/professores" className="btn-secondary">Cadastrar professor</Link>
          <Link href="/dashboard/modalidades" className="btn-secondary">Editar modalidades</Link>
        </div>
      </div>

      {mods && mods.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">Modalidades</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {mods.map((m) => (
              <span key={m.id} className="badge bg-brand-50 text-brand-700">
                {m.nome}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
