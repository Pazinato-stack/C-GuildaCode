"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessao } from "@/lib/auth";
import type { Modalidade } from "@/lib/types";

/** Bucket do Supabase Storage onde ficam as imagens das modalidades. */
const BUCKET_MODALIDADES = "modalidades";
const MAX_IMAGEM_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Gera um slug a partir do nome (sem acentos, minusculo, com hifens). */
function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Faz upload da imagem no Storage e devolve a URL publica.
 * Retorna null quando nenhum arquivo foi enviado.
 */
async function processarImagem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: FormDataEntryValue | null,
  slugBase: string
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    throw new Error("Envie uma imagem JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_IMAGEM_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${slugBase || "modalidade"}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_MODALIDADES)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(
      `Não foi possível enviar a imagem: ${error.message}. ` +
        'Verifique se o bucket "modalidades" existe e é público.'
    );
  }

  const { data } = supabase.storage
    .from(BUCKET_MODALIDADES)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Cria uma nova modalidade. Apenas ADMINISTRADORES podem criar.
 */
export async function criarModalidade(formData: FormData): Promise<Modalidade> {
  const sessao = await getSessao();
  if (!sessao?.isAdmin) {
    throw new Error("Apenas administradores podem criar modalidades.");
  }

  const supabase = await createClient();

  const nome = String(formData.get("nome") || "").trim();
  if (!nome) throw new Error("O nome da modalidade é obrigatório.");

  const slugInformado = String(formData.get("slug") || "").trim();
  const slug = gerarSlug(slugInformado || nome);
  if (!slug) throw new Error("Informe um nome válido para gerar o endereço.");

  const { data: existente } = await supabase
    .from("modalidades")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existente) {
    throw new Error(`Já existe uma modalidade com o endereço "${slug}".`);
  }

  const imagemUrl = await processarImagem(
    supabase,
    formData.get("imagem"),
    slug
  );

  const { data, error } = await supabase
    .from("modalidades")
    .insert({
      slug,
      nome,
      descricao: String(formData.get("descricao") || "").trim() || null,
      imagem_url: imagemUrl,
      horario: String(formData.get("horario") || "").trim() || null,
      local: String(formData.get("local") || "").trim() || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/modalidades");
  revalidatePath("/");

  return data as Modalidade;
}

/**
 * Atualiza uma modalidade existente. Admin pode editar todas;
 * professor apenas a sua propria modalidade.
 */
export async function atualizarModalidade(formData: FormData) {
  const sessao = await getSessao();
  if (!sessao) throw new Error("Sessão expirada. Faça login novamente.");

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  if (!sessao.isAdmin && sessao.modalidadeId !== id) {
    throw new Error("Você só pode editar a modalidade à qual está vinculado.");
  }

  const nome = String(formData.get("nome") || "").trim();
  if (!nome) throw new Error("O nome da modalidade é obrigatório.");

  const { data: atual } = await supabase
    .from("modalidades")
    .select("slug, imagem_url")
    .eq("id", id)
    .maybeSingle();

  const novaImagem = await processarImagem(
    supabase,
    formData.get("imagem"),
    atual?.slug ?? "modalidade"
  );

  // Campo de URL opcional: usado quando o admin prefere informar um link.
  const urlManual = String(formData.get("imagem_url") || "").trim() || null;

  const { error } = await supabase
    .from("modalidades")
    .update({
      nome,
      descricao: String(formData.get("descricao") || "").trim() || null,
      imagem_url: novaImagem ?? urlManual ?? atual?.imagem_url ?? null,
      horario: String(formData.get("horario") || "").trim() || null,
      local: String(formData.get("local") || "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/modalidades");
  revalidatePath("/");
}

/**
 * Remove a imagem atual da modalidade (volta a ficar "Sem imagem").
 */
export async function removerImagemModalidade(formData: FormData) {
  const sessao = await getSessao();
  if (!sessao?.isAdmin) {
    throw new Error("Apenas administradores podem remover imagens.");
  }

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  const { error } = await supabase
    .from("modalidades")
    .update({ imagem_url: null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/modalidades");
  revalidatePath("/");
}
