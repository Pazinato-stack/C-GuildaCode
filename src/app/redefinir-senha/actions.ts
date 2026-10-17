"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Define a nova senha apos o usuario clicar no link de recuperacao.
 * O Supabase ja deixou uma sessao valida ativa ao abrir essa pagina.
 */
export async function definirNovaSenha(formData: FormData) {
  const supabase = await createClient();

  const nova = String(formData.get("nova_senha") || "");
  const confirmar = String(formData.get("confirmar_senha") || "");

  if (nova.length < 6) {
    redirect(
      `/redefinir-senha?error=${encodeURIComponent(
        "A senha deve ter pelo menos 6 caracteres."
      )}`
    );
  }

  if (nova !== confirmar) {
    redirect(
      `/redefinir-senha?error=${encodeURIComponent("As senhas não conferem.")}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/redefinir-senha?error=${encodeURIComponent(
        "Link expirado. Solicite um novo e-mail de recuperação."
      )}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) {
    redirect(`/redefinir-senha?error=${encodeURIComponent(error.message)}`);
  }

  // Ao redefinir por conta propria, a senha provisoria deixa de valer.
  await supabase
    .from("perfis")
    .update({ precisa_trocar_senha: false })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
