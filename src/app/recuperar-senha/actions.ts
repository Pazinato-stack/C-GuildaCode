"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Envia um e-mail de recuperacao de senha para o professor.
 * O link do Supabase leva para /redefinir-senha, onde ele define a nova senha.
 */
export async function enviarRecuperacao(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect(
      `/recuperar-senha?error=${encodeURIComponent("Informe o seu e-mail.")}`
    );
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`,
  });

  // Por seguranca, nao revelamos se o e-mail existe ou nao.
  redirect(`/recuperar-senha?ok=1`);
}
