"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessao } from "@/lib/auth";

// Senha provisoria padrao dos professores.
// O professor e obrigado a troca-la no primeiro acesso.
const SENHA_PROVISORIA =
  process.env.PROFESSOR_DEFAULT_PASSWORD || "Futuro@2026";

function gerarSenhaProvisoria(): string {
  return SENHA_PROVISORIA;
}

export type CriarProfessorResultado = {
  email: string;
  senhaProvisoria: string;
};

export async function criarProfessor(
  formData: FormData
): Promise<CriarProfessorResultado> {
  const supabase = await createClient();

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const telefone = String(formData.get("telefone") || "").trim() || null;
  const modalidadeId = Number(formData.get("modalidade_id"));

  if (!email) {
    throw new Error(
      "E-mail é obrigatório: ele será o login de acesso do professor."
    );
  }

  const admin = createAdminClient();

  // 1) Cria o usuario no Supabase Auth (login + senha provisoria).
  const senhaProvisoria = gerarSenhaProvisoria();
  const { data: created, error: authError } = await admin.auth.admin.createUser(
    {
      email,
      password: senhaProvisoria,
      email_confirm: true,
      user_metadata: {
        nome,
        role: "professor",
        must_change_password: true,
      },
    }
  );

  if (authError || !created?.user) {
    throw new Error(
      authError?.message ?? "Não foi possível criar o acesso do professor."
    );
  }

  // 2) Cria o cadastro funcional do professor, vinculado ao login (perfil).
  const { error } = await supabase.from("professores").insert({
    perfil_id: created.user.id,
    nome,
    email,
    telefone,
    modalidade_id: modalidadeId,
    ativo: true,
  });

  if (error) {
    // Rollback: remove o usuario do Auth para nao deixar login orfao.
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/professores");
  revalidatePath("/dashboard");
  return { email, senhaProvisoria };
}

export async function atualizarProfessor(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("professores")
    .update({
      nome: String(formData.get("nome") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      telefone: String(formData.get("telefone") || "").trim() || null,
      modalidade_id: Number(formData.get("modalidade_id")),
      ativo: formData.get("ativo") === "on",
    })
    .eq("id", Number(formData.get("id")));

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/professores");
}

export type ResetarSenhaResultado = {
  email: string;
  senhaProvisoria: string;
};

/**
 * Admin redefine a senha de um professor: gera uma nova senha provisoria,
 * marca o perfil para trocar no proximo acesso e devolve as credenciais.
 */
export async function resetarSenhaProfessor(
  formData: FormData
): Promise<ResetarSenhaResultado> {
  const sessao = await getSessao();
  if (!sessao?.isAdmin) {
    throw new Error("Apenas administradores podem redefinir senhas.");
  }

  const supabase = await createClient();
  const id = Number(formData.get("id"));

  const { data: prof } = await supabase
    .from("professores")
    .select("perfil_id, email")
    .eq("id", id)
    .maybeSingle();

  if (!prof?.perfil_id) {
    throw new Error(
      "Este professor não possui login de acesso vinculado para redefinir."
    );
  }

  const senhaProvisoria = gerarSenhaProvisoria();
  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.updateUserById(
    prof.perfil_id,
    { password: senhaProvisoria }
  );

  if (authError) throw new Error(authError.message);

  // Forca a troca de senha no proximo login.
  const { error } = await supabase
    .from("perfis")
    .update({ precisa_trocar_senha: true })
    .eq("id", prof.perfil_id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/professores");
  return { email: prof.email ?? "", senhaProvisoria };
}

export async function excluirProfessor(formData: FormData) {
  const supabase = await createClient();
  const id = Number(formData.get("id"));

  // Descobre o login vinculado (se houver) antes de apagar o cadastro.
  const { data: prof } = await supabase
    .from("professores")
    .select("perfil_id")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("professores").delete().eq("id", id);

  // Remove tambem o usuario do Auth (perfis some via cascade).
  if (prof?.perfil_id) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(prof.perfil_id);
  }

  revalidatePath("/dashboard/professores");
  revalidatePath("/dashboard");
}
