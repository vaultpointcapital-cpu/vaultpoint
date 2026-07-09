"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

/** Read a text field from the form, trimmed. Returns "" if missing. */
function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Base URL of the running app (works locally and once deployed). */
async function siteOrigin(): Promise<string> {
  const headerList = await headers();
  return headerList.get("origin") ?? "http://localhost:3000";
}

/** Send the user back to a form page with an error message in the URL. */
function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// ---------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------
export async function signup(formData: FormData) {
  const fullName = field(formData, "full_name");
  const email = field(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (
    !fullName ||
    !email ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    fail(
      "/signup",
      "Please fill in every field. Password must be at least 8 characters."
    );
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where the confirmation email link lands after Supabase verifies it.
      emailRedirectTo: `${origin}/auth/callback`,
      // Picked up by the handle_new_user() trigger -> public.users.full_name
      data: { full_name: fullName },
    },
  });

  if (error) fail("/signup", error.message);

  redirect(
    `/login?message=${encodeURIComponent(
      "Almost there. Check your email and click the confirmation link, then log in."
    )}`
  );
}

// ---------------------------------------------------------------------
// Log in
// ---------------------------------------------------------------------
export async function login(formData: FormData) {
  const email = field(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (!email || typeof password !== "string" || password.length === 0) {
    fail("/login", "Please enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Common messages here: "Invalid login credentials", "Email not confirmed"
  if (error) fail("/login", error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ---------------------------------------------------------------------
// Log out
// ---------------------------------------------------------------------
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

// ---------------------------------------------------------------------
// Forgot password (request the reset email)
// ---------------------------------------------------------------------
export async function forgotPassword(formData: FormData) {
  const email = field(formData, "email").toLowerCase();

  if (!email) fail("/forgot-password", "Please enter your email address.");

  const supabase = await createClient();
  const origin = await siteOrigin();

  await supabase.auth.resetPasswordForEmail(email, {
    // The email link creates a session at /auth/callback, which then
    // forwards the user to /reset-password to choose a new password.
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Deliberately the same message whether or not the account exists --
  // never confirm to a stranger which emails have VaultPoint accounts.
  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "If an account exists for that email, a password reset link is on its way."
    )}`
  );
}

// ---------------------------------------------------------------------
// Reset password (user arrived via the email link and has a session)
// ---------------------------------------------------------------------
export async function resetPassword(formData: FormData) {
  const password = formData.get("password");
  const confirm = formData.get("confirm_password");

  if (typeof password !== "string" || password.length < 8) {
    fail("/reset-password", "Password must be at least 8 characters.");
  }
  if (password !== confirm) {
    fail("/reset-password", "Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) fail("/reset-password", error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
