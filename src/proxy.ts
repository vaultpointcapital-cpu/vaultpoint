import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed the "middleware" convention to "proxy".
// Same job as before: refresh the Supabase session on every request,
// and do an optimistic auth check to redirect users to the right place.
//
// IMPORTANT: the proxy is a convenience layer, not the security boundary.
// Every protected page and server action re-checks auth itself, and the
// database enforces Row Level Security regardless.

// Paths that do not require a logged-in user (exact match).
const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/auth/callback"];

// Logged-in users get bounced away from these, back to the dashboard.
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run other code between createServerClient and getUser() --
  // it can cause subtle session bugs that are very hard to debug.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.includes(path);
  const isAuthPage = AUTH_PAGES.includes(path);

  // Build a redirect that carries along any freshly rotated auth cookies.
  // Dropping them here can silently log the user out.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  // Not logged in and trying to reach a protected page -> login.
  if (!user && !isPublic) {
    return redirectTo("/login");
  }

  // Already logged in and visiting login/signup -> dashboard.
  if (user && isAuthPage) {
    return redirectTo("/dashboard");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
