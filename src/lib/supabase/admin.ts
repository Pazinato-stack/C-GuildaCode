import { createClient } from "@supabase/supabase-js";

// Cliente com a chave service_role. Uso EXCLUSIVO no servidor.
// Nunca importe este arquivo em componentes/client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
