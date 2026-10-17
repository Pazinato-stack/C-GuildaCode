import { createClient } from "@/lib/supabase/server";
import { marcarTodosPresentes } from "./actions";
import { ChamadaLista } from "./ChamadaLista";
import type { Aluno, Chamada, Modalidade } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chamada | Projeto Futuro" };

export default async function ChamadaPage({
  searchParams,
}: {
  searchParams: { modalidade?: string; data?: string };
}) {
  const supabase = await createClient();

  const { data: modalidadesData } = await supabase
    .from("modalidades")
    .select("*")
    .order("id");
  const modalidades = (modalidadesData ?? []) as Modalidade[];

  const hoje = new Date().toISOString().slice(0, 10);
  const dataSel = searchParams?.data || hoje;

  const modalidadeSel = searchParams?.modalidade
    ? Number(searchParams.modalidade)
    : modalidades[0]?.id;

  let alunos: Aluno[] = [];
  let chamadas: Chamada[] = [];

  if (modalidadeSel) {
    const [{ data: alunosData }, { data: chamadasData }] = await Promise.all([
      supabase
        .from("alunos")
        .select("*")
        .eq("modalidade_id", modalidadeSel)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("chamadas")
        .select("*")
        .eq("modalidade_id", modalidadeSel)
        .eq("data", dataSel),
    ]);
    alunos = (alunosData ?? []) as Aluno[];
    chamadas = (chamadasData ?? []) as Chamada[];
  }

  const presencas = new Map(chamadas.map((c) => [c.aluno_id, c]));
  const totalPresentes = chamadas.filter((c) => c.presente).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chamada de Presença</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione a modalidade e a data, depois marque a presença dos alunos.
        </p>
      </div>

      {/* Filtros */}
      <form className="card flex flex-wrap items-end gap-4 p-4" method="get">
        <div className="min-w-[200px] flex-1">
          <label className="label">Modalidade</label>
          <select
            name="modalidade"
            defaultValue={modalidadeSel}
            className="input"
          >
            {modalidades.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="label">Data</label>
          <input type="date" name="data" defaultValue={dataSel} className="input" />
        </div>
        <button type="submit" className="btn-primary">
          Carregar
        </button>
      </form>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Alunos ativos</p>
          <p className="text-2xl font-extrabold text-slate-900">{alunos.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Presentes</p>
          <p className="text-2xl font-extrabold text-green-600">{totalPresentes}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Ausentes/faltando</p>
          <p className="text-2xl font-extrabold text-red-500">
            {Math.max(alunos.length - totalPresentes, 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          Lista de presença
        </h2>
        {alunos.length > 0 && (
          <form action={marcarTodosPresentes}>
            <input type="hidden" name="modalidade_id" value={modalidadeSel} />
            <input type="hidden" name="data" value={dataSel} />
            <button type="submit" className="btn-secondary">
              Marcar todos presentes
            </button>
          </form>
        )}
      </div>

      <ChamadaLista
        alunos={alunos}
        presencas={Object.fromEntries(
          chamadas.map((c) => [c.aluno_id, { presente: c.presente }])
        )}
        modalidadeId={modalidadeSel ?? 0}
        data={dataSel}
      />
    </div>
  );
}
