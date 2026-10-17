"use client";

import { useOptimistic, useTransition } from "react";
import { registrarChamada } from "./actions";
import type { Aluno } from "@/lib/types";

type Props = {
  alunos: Aluno[];
  presencas: Record<string, { presente: boolean }>;
  modalidadeId: number;
  data: string;
};

export function ChamadaLista({ alunos, presencas, modalidadeId, data }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    presencas,
    (
      state: Record<string, { presente: boolean }>,
      update: { alunoId: number; presente: boolean }
    ) => ({ ...state, [String(update.alunoId)]: { presente: update.presente } })
  );

  const toggle = (alunoId: number, presente: boolean) => {
    const fd = new FormData();
    fd.set("aluno_id", String(alunoId));
    fd.set("modalidade_id", String(modalidadeId));
    fd.set("data", data);
    fd.set("presente", String(presente));
    startTransition(async () => {
      setOptimistic({ alunoId, presente });
      await registrarChamada(fd);
    });
  };

  if (alunos.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-400">
        Nenhum aluno ativo nesta modalidade.
      </div>
    );
  }

  return (
    <div className={`card divide-y divide-slate-100 ${pending ? "opacity-70" : ""}`}>
      {alunos.map((a) => {
        const estado = optimistic[String(a.id)]?.presente;
        const marcado = estado === true;
        const ausente = estado === false;

        return (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">{a.nome}</p>
              <p className="text-xs text-slate-400">
                {a.telefone || a.email || "—"}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => toggle(a.id, true)}
                className={`btn ${
                  marcado
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "border border-green-200 text-green-700 hover:bg-green-50"
                }`}
              >
                Presente
              </button>
              <button
                type="button"
                onClick={() => toggle(a.id, false)}
                className={`btn ${
                  ausente
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-red-200 text-red-600 hover:bg-red-50"
                }`}
              >
                Falta
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
