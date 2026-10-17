"use client";

import { useState, useTransition } from "react";

type Props<T = void> = {
  action: (formData: FormData) => Promise<T>;
  children: React.ReactNode;
  submitLabel?: string;
  trigger: React.ReactNode;
  /** Se definido, NAO fecha automaticamente: entrega o resultado da action. */
  onDone?: (result: T) => void;
  /** Captura erros lancados pela action em vez de estourar a tela. */
  onError?: (message: string) => void;
  /** Exibe o erro dentro do proprio modal (recomendado junto de onDone). */
  exibirErro?: boolean;
};

export function Modal<T = void>({
  action,
  children,
  submitLabel = "Salvar",
  trigger,
  onDone,
  onError,
  exibirErro = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const controlled = Boolean(onDone || onError);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErro(null);
          setOpen(true);
        }}
      >
        {trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <form
              action={(fd) =>
                startTransition(async () => {
                  setErro(null);
                  try {
                    const result = await action(fd);
                    if (onDone) onDone(result);
                    else setOpen(false);
                  } catch (err) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : "Ocorreu um erro inesperado.";
                    if (onError) {
                      onError(message);
                    } else if (exibirErro) {
                      setErro(message);
                    } else {
                      throw err;
                    }
                  }
                })
              }
              encType="multipart/form-data"
              className="space-y-4"
            >
              {children}
              {erro && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {erro}
                </p>
              )}
              {!controlled && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={pending} className="btn-primary">
                    {pending ? "Salvando..." : submitLabel}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
