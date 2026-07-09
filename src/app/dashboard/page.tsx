import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

type Profile = {
  full_name: string | null;
  email: string;
  country: string | null;
  onboarding_completed: boolean | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Belt and braces: the proxy already guards this route, but the proxy is
  // an optimistic check only. Every protected page re-verifies the user.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // This row was created automatically by the handle_new_user() trigger,
  // and RLS only lets the logged-in user read their own row. If data shows
  // up below, the whole auth pipeline is working end to end.
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, country, onboarding_completed")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0C10] text-[#F0F2F8]">
      {/* Top bar */}
      <header className="border-b border-[#1E2330]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <p className="text-lg font-semibold tracking-wide">
            Vault<span className="text-[#6C63FF]">Point</span>
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="cursor-pointer rounded-[12px] border border-[#1E2330] px-3.5 py-1.5 text-[13px] text-[#8B92A5] transition-colors hover:border-[#6C63FF] hover:text-[#F0F2F8]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Vault Glow behind the welcome heading */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-40 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#6C63FF] opacity-15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-[15px] text-[#8B92A5]">
          Your vault is open. Markets, Pods, and Aria arrive in the next
          sprints.
        </p>

        <div className="mt-10 rounded-[16px] border border-[#1E2330] bg-[#111318] p-6">
          <p className="border-b border-[#1E2330] pb-3 text-[11px] font-medium uppercase tracking-widest text-[#4A5168]">
            Account -- loaded through RLS
          </p>
          <dl className="mt-4 space-y-3 text-[15px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#8B92A5]">Email</dt>
              <dd className="font-mono text-[13px]">
                {profile?.email ?? user.email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#8B92A5]">Full name</dt>
              <dd>{profile?.full_name ?? "Not set"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#8B92A5]">Country</dt>
              <dd>{profile?.country ?? "Not set"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#8B92A5]">Onboarding</dt>
              <dd
                className={
                  profile?.onboarding_completed
                    ? "text-[#00E5A0]"
                    : "text-[#FF6B35]"
                }
              >
                {profile?.onboarding_completed ? "Completed" : "Not yet"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
