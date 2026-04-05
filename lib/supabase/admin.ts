import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client com service_role key.
 * Usar APENAS em Route Handlers do lado servidor (nunca expor ao cliente).
 * Bypassa RLS — usar com cuidado.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
