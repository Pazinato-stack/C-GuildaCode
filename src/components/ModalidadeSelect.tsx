import type { Modalidade } from "@/lib/types";

export function ModalidadeSelect({
  modalidades,
  defaultId,
  name = "modalidade_id",
  disabled = false,
}: {
  modalidades: Pick<Modalidade, "id" | "nome">[];
  defaultId?: number;
  name?: string;
  /** Trava o campo (usado para professores, que só atuam na própria modalidade). */
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <>
        <select disabled defaultValue={defaultId ?? ""} className="input bg-slate-100">
          <option value="" disabled>
            Selecione a modalidade
          </option>
          {modalidades.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        {/* Campo oculto garante o envio do valor quando o select esta travado */}
        <input type="hidden" name={name} value={defaultId ?? ""} />
      </>
    );
  }

  return (
    <select name={name} required defaultValue={defaultId ?? ""} className="input">
      <option value="" disabled>
        Selecione a modalidade
      </option>
      {modalidades.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nome}
        </option>
      ))}
    </select>
  );
}
