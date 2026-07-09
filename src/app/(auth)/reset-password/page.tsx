import { resetPassword } from "../actions";

const inputClass =
  "w-full rounded-[12px] border border-[#1E2330] bg-[#0A0C10] px-3.5 py-2.5 text-[15px] text-[#F0F2F8] placeholder:text-[#4A5168] outline-none transition-colors focus:border-[#6C63FF]";
const labelClass = "mb-1.5 block text-[13px] text-[#8B92A5]";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0C10] px-4">
      {/* Vault Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C63FF] opacity-20 blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <p className="text-center text-lg font-semibold tracking-wide text-[#F0F2F8]">
          Vault<span className="text-[#6C63FF]">Point</span>
        </p>
        <p className="mt-1 text-center text-sm text-[#8B92A5]">
          Choose a new password
        </p>

        {error && (
          <p className="mt-5 rounded-[12px] border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#FF6B35]">
            {error}
          </p>
        )}

        <form
          action={resetPassword}
          className="mt-5 space-y-4 rounded-[16px] border border-[#1E2330] bg-[#111318] p-6"
        >
          <div>
            <label htmlFor="password" className={labelClass}>
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-[12px] bg-[#6C63FF] px-3.5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#7C74FF]"
          >
            Save new password
          </button>
        </form>
      </div>
    </main>
  );
}
