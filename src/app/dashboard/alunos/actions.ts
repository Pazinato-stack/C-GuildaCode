"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessao } from "@/lib/auth";

export async function criarAluno(formData: FormData) {
  const sessao = await getSessao();
  if (!sessao) throw new Error("Sessão expirada. Faça login novamente.");

  const supabase = await createClient();

  // Professor so pode cadastrar alunos na SUA modalidade e vinculados a ele.
  const modalidadeId = sessao.isAdmin
    ? Number(formData.get("modalidade_id"))
    : sessao.modalidadeId;

  const professorId = sessao.isAdmin
    ? Number(formData.get("professor_id")) || null
    : sessao.professorId;

  if (!modalidadeId) {
    throw new Error("Modalidade não definida para este usuário.");
  }

  const { error } = await supabase.from("alunos").insert({
    nome: String(formData.get("nome") || "").trim(),
    email: String(formData.get("email") || "").trim() || null,
    telefone: String(formData.get("telefone") || "").trim() || null,
    data_nascimento: String(formData.get("data_nascimento") || "").trim() || null,
    modalidade_id: modalidadeId,
    professor_id: professorId,
    ativo: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/alunos");
  revalidatePath("/dashboard");
}

export async function atualizarAluno(formData: FormData) {
  const sessao = await getSessao();
  if (!sessao) throw new Error("Sessão expirada. Faça login novamente.");

  const supabase = await createClient();

  // Professor não pode mover o aluno para outra modalidade nem outro professor.
  const modalidadeId = sessao.isAdmin
    ? Number(formData.get("modalidade_id"))
    : sessao.modalidadeId;

  const professorId = sessao.isAdmin
    ? Number(formData.get("professor_id")) || null
    : sessao.professorId;

  const { error } = await supabase
    .from("alunos")
    .update({
      nome: String(formData.get("nome") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      telefone: String(formData.get("telefone") || "").trim() || null,
      data_nascimento: String(formData.get("data_nascimento") || "").trim() || null,
      modalidade_id: modalidadeId,
      professor_id: professorId,
      ativo: formData.get("ativo") === "on",
    })
    .eq("id", Number(formData.get("id")));

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/alunos");
}

export async function excluirAluno(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("alunos").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/dashboard/alunos");
  revalidatePath("/dashboard");
}
