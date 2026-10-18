import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Recebe o retorno do Supabase (recuperacao de senha, magic link, OAuth).
 *
 * Dois formatos chegam aqui:
 *  - ?code=...        -> fluxo PKCE (padrao atual do @supabase/ssr)
 *  - ?token_hash=...  -> fluxo de token por e-mail
 *
 * Em ambos os casos trocamos por uma sessao valida e redirecionamos
 * para a pagina informada em ?next= (padrao: /redefinir-senha).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/redefinir-senha";

  // Erro devolvido pelo proprio Supabase (link expirado, etc).
  const erroSupabase =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (erroSupabase) {
    return NextResponse.redirect(
      `${origin}/recuperar-senha?error=${encodeURIComponent(erroSupabase)}`
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/recuperar-senha?error=${encodeURIComponent(
          "Não foi possível validar o link. Solicite um novo e-mail de recuperação."
        )}`
      );
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "magiclink" | "email" | "signup" | "invite",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}/recuperar-senha?error=${encodeURIComponent(
          "Link expirado. Solicite um novo e-mail de recuperação."
        )}`
      );
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/recuperar-senha?error=${encodeURIComponent("Link inválido.")}`);
}
