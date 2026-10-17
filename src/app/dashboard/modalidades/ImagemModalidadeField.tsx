"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  /** URL atual (edicao) */
  atual?: string | null;
  /** "criar" | "editar" */
  modo?: "criar" | "editar";
};

/**
 * Campo de upload de imagem com previa local.
 * Envia o arquivo no input "imagem" (multipart/form-data).
 */
export function ImagemModalidadeField({ atual, modo = "criar" }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);

  const imagemExibida = preview ?? atual ?? null;

  return (
    <div className="space-y-2">
      <label className="label">Imagem da modalidade</label>

      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {imagemExibida ? (
          <Image
            src={imagemExibida}
            alt="Prévia da imagem"
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover"
            unoptimized={Boolean(preview)}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            Nenhuma imagem selecionada
          </div>
        )}
      </div>

      <input
        type="file"
        name="imagem"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            setPreview(null);
            setNomeArquivo(null);
            return;
          }
          setPreview(URL.createObjectURL(file));
          setNomeArquivo(file.name);
        }}
        className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
      />
      <p className="text-xs text-slate-400">
        JPG, PNG, WEBP ou GIF · até 5 MB
        {nomeArquivo ? ` · selecionado: ${nomeArquivo}` : ""}
        {modo === "editar" && !nomeArquivo && atual
          ? " · envie um arquivo para substituir a imagem atual"
          : ""}
      </p>
    </div>
  );
}
