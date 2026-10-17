"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function trocarSenha(formData: FormData) {
  const supabase = await createClient();

  const nova = String(formData.get("nova_senha") || "");
  const confirmar = String(formData.get("confirmar_senha") || "");

  if (nova.length < 6) {
    redirect(
      `/trocar-senha?error=${encodeURIComponent(
        "A senha deve ter pelo menos 6 caracteres."
      )}`
    );
  }

  if (nova !== confirmar) {
    redirect(
      `/trocar-senha?error=${encodeURIComponent("As senhas não conferem.")}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) {
    redirect(`/trocar-senha?error=${encodeURIComponent(error.message)}`);
  }

  // Limpa a flag de senha provisoria no perfil.
  await supabase
    .from("perfis")
    .update({ precisa_trocar_senha: false })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
