import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// DANGER: service_role bypasses Row Level Security entirely.
// Only import this in server-only code (API routes, Server Actions, the
// Python/FastAPI service later). NEVER import this in a "use client" file —
// Next.js will throw if you try, since SUPABASE_SERVICE_ROLE_KEY has no
// NEXT_PUBLIC_ prefix and isn't exposed to the browser bundle.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
