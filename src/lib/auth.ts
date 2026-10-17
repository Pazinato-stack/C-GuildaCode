import { createClient } from "@/lib/supabase/server";

export type SessaoUsuario = {
  userId: string;
  nome: string;
  email: string;
  role: "admin" | "professor";
  /** Preenchido apenas quando role = "professor" */
  professorId: number | null;
  /** Modalidade vinculada ao professor (null para admin). */
  modalidadeId: number | null;
  isAdmin: boolean;
};

/**
 * Retorna o contexto do usuario logado: papel (admin/professor),
 * o id do cadastro de professor e a modalidade vinculada.
 * Usado para aplicar as regras de acesso por modalidade.
 */
export async function getSessao(): Promise<SessaoUsuario | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (perfil?.role as "admin" | "professor") ?? "professor";

  let professorId: number | null = null;
  let modalidadeId: number | null = null;

  if (role === "professor") {
    const { data: prof } = await supabase
      .from("professores")
      .select("id, modalidade_id")
      .eq("perfil_id", user.id)
      .maybeSingle();

    professorId = prof?.id ?? null;
    modalidadeId = prof?.modalidade_id ?? null;
  }

  return {
    userId: user.id,
    nome: perfil?.nome || user.email || "Usuário",
    email: perfil?.email || user.email || "",
    role,
    professorId,
    modalidadeId,
    isAdmin: role === "admin",
  };
}
