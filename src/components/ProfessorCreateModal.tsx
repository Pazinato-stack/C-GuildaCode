"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import type { CriarProfessorResultado } from "@/app/dashboard/professores/actions";

type Props = {
  action: (formData: FormData) => Promise<CriarProfessorResultado>;
  children: React.ReactNode;
  trigger: React.ReactNode;
  submitLabel?: string;
  /** Título exibido quando as credenciais sao geradas. */
  tituloSucesso?: string;
  /** Mensagem de apoio exibida junto das credenciais. */
  mensagemSucesso?: string;
};

/**
 * Modal que executa uma action que retorna credenciais (criar ou resetar senha
 * de professor) e exibe e-mail + senha provisoria para o admin repassar.
 */
export function ProfessorCreateModal({
  action,
  children,
  trigger,
  submitLabel = "Cadastrar professor",
  tituloSucesso = "Professor cadastrado! 🎉",
  mensagemSucesso = "Repasse estas credenciais para o professor. Ele deverá trocar a senha no primeiro acesso.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [credenciais, setCredenciais] =
    useState<CriarProfessorResultado | null>(null);

  function reset() {
    setOpen(false);
    setErro(null);
    setCredenciais(null);
  }

  return (
    <Modal
      action={action}
      submitLabel={submitLabel}
      trigger={trigger}
      onDone={(result) => {
        setErro(null);
        setCredenciais(result);
      }}
      onError={(message) => setErro(message)}
    >
      {credenciais ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{tituloSucesso}</h2>
          <p className="text-sm text-slate-600">{mensagemSucesso}</p>
          <div className="space-y-2 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm">
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">
                E-mail (login)
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {credenciais.email}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">
                Senha provisória
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {credenciais.senhaProvisoria}
              </span>
            </div>
          </div>
          <button type="button" onClick={reset} className="btn-primary w-full">
            Concluir
          </button>
        </div>
      ) : erro ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Não foi possível concluir
          </h2>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
          <button
            type="button"
            onClick={() => setErro(null)}
            className="btn-secondary w-full"
          >
            Voltar
          </button>
        </div>
      ) : (
        children
      )}
    </Modal>
  );
}
