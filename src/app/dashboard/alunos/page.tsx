import { createClient } from "@/lib/supabase/server";
import { getSessao } from "@/lib/auth";
import { Modal } from "@/components/Modal";
import { ModalidadeSelect } from "@/components/ModalidadeSelect";
import { criarAluno, atualizarAluno, excluirAluno } from "./actions";
import type { Aluno, Modalidade, Professor } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alunos | Projeto Futuro" };

function AlunoFields({
  modalidades,
  professores,
  aluno,
  travarModalidade = false,
  professorFixoId,
}: {
  modalidades: Pick<Modalidade, "id" | "nome">[];
  professores: Pick<Professor, "id" | "nome">[];
  aluno?: Aluno;
  travarModalidade?: boolean;
  professorFixoId?: number;
}) {
  return (
    <>
      <div>
        <label className="label">Nome completo *</label>
        <input name="nome" defaultValue={aluno?.nome ?? ""} required className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">E-mail</label>
          <input name="email" type="email" defaultValue={aluno?.email ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input name="telefone" defaultValue={aluno?.telefone ?? ""} className="input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Data de nascimento</label>
          <input
            name="data_nascimento"
            type="date"
            defaultValue={aluno?.data_nascimento ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Modalidade *</label>
          <ModalidadeSelect
            modalidades={modalidades}
            defaultId={aluno?.modalidade_id ?? professorFixoId}
            disabled={travarModalidade}
          />
        </div>
      </div>
      <div>
        <label className="label">Professor responsável</label>
        {travarModalidade ? (
          <input
            disabled
            className="input bg-slate-100"
            value={professores[0]?.nome ?? "Você"}
          />
        ) : (
          <select name="professor_id" defaultValue={aluno?.professor_id ?? ""} className="input">
            <option value="">Não definido</option>
            {professores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        )}
      </div>
      {aluno && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="ativo" defaultChecked={aluno.ativo} className="h-4 w-4" />
          Aluno ativo
        </label>
      )}
    </>
  );
}

export default async function AlunosPage() {
  const sessao = await getSessao();
  const supabase = await createClient();

  // Professor enxerga apenas alunos da sua modalidade.
  let alunosQuery = supabase
    .from("alunos")
    .select("*, modalidades(nome, slug), professores(nome)")
    .order("nome", { ascending: true });

  if (sessao && !sessao.isAdmin && sessao.modalidadeId) {
    alunosQuery = alunosQuery.eq("modalidade_id", sessao.modalidadeId);
  }

  const [{ data: alunosData }, { data: modalidadesData }, { data: professoresData }] =
    await Promise.all([
      alunosQuery,
      supabase.from("modalidades").select("id, nome").order("id"),
      supabase.from("professores").select("id, nome").order("nome"),
    ]);

  const alunos = (alunosData ?? []) as Aluno[];
  const todasModalidades = (modalidadesData ?? []) as Pick<Modalidade, "id" | "nome">[];
  const todosProfessores = (professoresData ?? []) as Pick<Professor, "id" | "nome">[];

  const isProfessor = Boolean(sessao && !sessao.isAdmin);

  // Para professor: limita modalidades/professores à sua realidade.
  const modalidades = isProfessor
    ? todasModalidades.filter((m) => Number(m.id) === sessao?.modalidadeId)
    : todasModalidades;

  const professores = isProfessor
    ? todosProfessores.filter((p) => Number(p.id) === sessao?.professorId)
    : todosProfessores;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alunos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {alunos.length} aluno(s) cadastrado(s).
          </p>
        </div>
        <Modal
          action={criarAluno}
          submitLabel="Cadastrar aluno"
          trigger={<span className="btn-primary">+ Novo aluno</span>}
        >
          <h2 className="text-lg font-bold text-slate-900">Cadastrar aluno</h2>
          <AlunoFields
            modalidades={modalidades}
            professores={professores}
            travarModalidade={isProfessor}
            professorFixoId={sessao?.modalidadeId ?? undefined}
          />
        </Modal>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Modalidade</th>
                <th className="px-4 py-3">Professor</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alunos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Nenhum aluno cadastrado ainda.
                  </td>
                </tr>
              )}
              {alunos.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{a.nome}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-brand-50 text-brand-700">
                      {a.modalidades?.nome ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.professores?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{a.telefone ?? "—"}</div>
                    <div className="text-xs text-slate-400">{a.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        a.ativo
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {a.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Modal
                        action={atualizarAluno}
                        trigger={<span className="btn-secondary">Editar</span>}
                      >
                        <h2 className="text-lg font-bold text-slate-900">Editar aluno</h2>
                        <input type="hidden" name="id" value={a.id} />
                        <AlunoFields
                          modalidades={modalidades}
                          professores={professores}
                          aluno={a}
                          travarModalidade={isProfessor}
                          professorFixoId={sessao?.modalidadeId ?? undefined}
                        />
                      </Modal>
                      <form action={excluirAluno}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="btn-danger"
                          formNoValidate
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
