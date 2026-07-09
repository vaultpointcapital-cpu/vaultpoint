import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components ("use client"). Reads the public anon key only —
// never put the service_role key here, it must stay server-side.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
