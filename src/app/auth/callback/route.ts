import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Every email link (confirm signup, password reset) lands here first.
// Supabase verifies the link on their side, then redirects to this route
// with a one-time ?code=. We exchange that code for a real session cookie,
// then forward the user to their destination.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only allow same-site relative redirects. Never trust a full URL from
  // the query string -- that would be an open-redirect vulnerability.
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "That link is invalid or has expired. Please request a new one."
    )}`
  );
}
