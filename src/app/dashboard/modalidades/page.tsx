import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getSessao } from "@/lib/auth";
import { Modal } from "@/components/Modal";
import { ImagemModalidadeField } from "./ImagemModalidadeField";
import {
  atualizarModalidade,
  criarModalidade,
  removerImagemModalidade,
} from "./actions";
import type { Modalidade } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modalidades | Projeto Futuro" };

export default async function ModalidadesPage() {
  const [supabase, sessao] = await Promise.all([createClient(), getSessao()]);

  const { data } = await supabase
    .from("modalidades")
    .select("*")
    .order("id", { ascending: true });

  const modalidades = (data ?? []) as Modalidade[];
  const isAdmin = Boolean(sessao?.isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modalidades</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Crie novas modalidades e edite nome, descrição, imagem, horário e local."
              : "Edite o nome, descrição, imagem, horário e local da sua modalidade."}
          </p>
        </div>

        {isAdmin && (
          <Modal
            action={criarModalidade}
            submitLabel="Criar modalidade"
            exibirErro
            trigger={<span className="btn-primary">+ Nova modalidade</span>}
          >
            <h2 className="text-lg font-bold text-slate-900">Nova modalidade</h2>

            <div>
              <label className="label">Nome</label>
              <input
                name="nome"
                required
                placeholder="Ex: Judô"
                className="input"
              />
            </div>

            <div>
              <label className="label">Endereço (slug) — opcional</label>
              <input name="slug" placeholder="Ex: judo" className="input" />
              <p className="mt-1 text-xs text-slate-400">
                Deixe em branco para gerar automaticamente a partir do nome.
              </p>
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea
                name="descricao"
                rows={3}
                placeholder="Breve descrição da modalidade"
                className="input"
              />
            </div>

            <ImagemModalidadeField modo="criar" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Horário</label>
                <input
                  name="horario"
                  placeholder="Seg e Qua - 18h"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Local</label>
                <input
                  name="local"
                  placeholder="Pista Central"
                  className="input"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modalidades.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="relative h-40 w-full bg-slate-100">
              {m.imagem_url ? (
                <Image
                  src={m.imagem_url}
                  alt={m.nome}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-slate-400">
                  Sem imagem
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900">{m.nome}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {m.descricao || "Sem descrição"}
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-slate-400">
                {m.horario && <p>🕑 {m.horario}</p>}
                {m.local && <p>📍 {m.local}</p>}
              </div>

              {(isAdmin || sessao?.modalidadeId === m.id) && (
                <div className="mt-4">
                  <Modal
                    action={atualizarModalidade}
                    submitLabel="Salvar alterações"
                    exibirErro
                    trigger={
                      <span className="btn-secondary w-full">Editar</span>
                    }
                  >
                    <h2 className="text-lg font-bold text-slate-900">
                      Editar {m.nome}
                    </h2>
                    <input type="hidden" name="id" value={m.id} />

                    <div>
                      <label className="label">Nome</label>
                      <input
                        name="nome"
                        defaultValue={m.nome}
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label">Descrição</label>
                      <textarea
                        name="descricao"
                        defaultValue={m.descricao ?? ""}
                        rows={3}
                        className="input"
                      />
                    </div>

                    <ImagemModalidadeField atual={m.imagem_url} modo="editar" />

                    <details className="text-sm">
                      <summary className="cursor-pointer text-slate-500">
                        Ou usar URL de imagem externa
                      </summary>
                      <input
                        name="imagem_url"
                        type="url"
                        defaultValue={
                          m.imagem_url && !m.imagem_url.includes("/storage/v1/")
                            ? m.imagem_url
                            : ""
                        }
                        placeholder="https://..."
                        className="input mt-2"
                      />
                    </details>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Horário</label>
                        <input
                          name="horario"
                          defaultValue={m.horario ?? ""}
                          placeholder="Seg e Qua - 18h"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Local</label>
                        <input
                          name="local"
                          defaultValue={m.local ?? ""}
                          placeholder="Pista Central"
                          className="input"
                        />
                      </div>
                    </div>
                  </Modal>

                  {isAdmin && m.imagem_url && (
                    <Modal
                      action={removerImagemModalidade}
                      submitLabel="Remover imagem"
                      exibirErro
                      trigger={
                        <span className="mt-2 block w-full text-center text-xs text-red-500 hover:underline">
                          Remover imagem
                        </span>
                      }
                    >
                      <h2 className="text-lg font-bold text-slate-900">
                        Remover imagem de {m.nome}?
                      </h2>
                      <p className="text-sm text-slate-500">
                        A modalidade voltará a exibir &quot;Sem imagem&quot;.
                      </p>
                      <input type="hidden" name="id" value={m.id} />
                    </Modal>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {modalidades.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma modalidade cadastrada ainda.
            {isAdmin ? ' Use "+ Nova modalidade" para começar.' : ""}
          </p>
        )}
      </div>
    </div>
  );
}
