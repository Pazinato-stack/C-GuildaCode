import { createClient } from "@/lib/supabase/server";
import { getSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ProfessorCreateModal } from "@/components/ProfessorCreateModal";
import { ModalidadeSelect } from "@/components/ModalidadeSelect";
import { criarProfessor, atualizarProfessor, excluirProfessor, resetarSenhaProfessor } from "./actions";
import type { Modalidade, Professor } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Professores | Projeto Futuro" };

function ProfessorFields({
  modalidades,
  professor,
}: {
  modalidades: Pick<Modalidade, "id" | "nome">[];
  professor?: Professor;
}) {
  return (
    <>
      <div>
        <label className="label">Nome completo *</label>
        <input name="nome" defaultValue={professor?.nome ?? ""} required className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">E-mail (login) *</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={professor?.email ?? ""}
            className="input"
            placeholder="professor@email.com"
          />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input name="telefone" defaultValue={professor?.telefone ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Modalidade *</label>
        <ModalidadeSelect modalidades={modalidades} defaultId={professor?.modalidade_id} />
      </div>
      {professor && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="ativo" defaultChecked={professor.ativo} className="h-4 w-4" />
          Professor ativo
        </label>
      )}
    </>
  );
}

export default async function ProfessoresPage() {
  const sessao = await getSessao();
  if (sessao && !sessao.isAdmin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: profsData }, { data: modalidadesData }] = await Promise.all([
    supabase
      .from("professores")
      .select("*, modalidades(nome, slug)")
      .order("nome", { ascending: true }),
    supabase.from("modalidades").select("id, nome").order("id"),
  ]);

  const professores = (profsData ?? []) as Professor[];
  const modalidades = (modalidadesData ?? []) as Pick<Modalidade, "id" | "nome">[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Professores</h1>
          <p className="mt-1 text-sm text-slate-500">
            {professores.length} professor(es) cadastrado(s).
          </p>
        </div>
        <ProfessorCreateModal
          action={criarProfessor}
          submitLabel="Cadastrar professor"
          trigger={<span className="btn-primary">+ Novo professor</span>}
        >
          <h2 className="text-lg font-bold text-slate-900">Cadastrar professor</h2>
          <p className="text-sm text-slate-500">
            Informe o e-mail: ele será o login do professor. Uma senha provisória
            será gerada para o primeiro acesso.
          </p>
          <ProfessorFields modalidades={modalidades} />
        </ProfessorCreateModal>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Modalidade</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {professores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Nenhum professor cadastrado ainda.
                  </td>
                </tr>
              )}
              {professores.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-brand-50 text-brand-700">
                      {p.modalidades?.nome ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{p.telefone ?? "—"}</div>
                    <div className="text-xs text-slate-400">{p.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        p.ativo
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ProfessorCreateModal
                        action={resetarSenhaProfessor}
                        submitLabel="Gerar nova senha"
                        tituloSucesso="Senha redefinida! 🔑"
                        mensagemSucesso="Repasse a nova senha provisória para o professor. Ele deverá trocá-la no próximo acesso."
                        trigger={<span className="btn-secondary">Resetar senha</span>}
                      >
                        <h2 className="text-lg font-bold text-slate-900">
                          Resetar senha
                        </h2>
                        <p className="text-sm text-slate-500">
                          Gerar uma nova senha provisória para{" "}
                          <strong>{p.nome}</strong>? A senha atual deixará de
                          funcionar e ele deverá trocá-la no próximo acesso.
                        </p>
                        <input type="hidden" name="id" value={p.id} />
                      </ProfessorCreateModal>
                      <Modal
                        action={atualizarProfessor}
                        trigger={<span className="btn-secondary">Editar</span>}
                      >
                        <h2 className="text-lg font-bold text-slate-900">Editar professor</h2>
                        <input type="hidden" name="id" value={p.id} />
                        <ProfessorFields modalidades={modalidades} professor={p} />
                      </Modal>
                      <form action={excluirProfessor}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="btn-danger">
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
