import Link from "next/link";
import { forgotPassword } from "../actions";

const inputClass =
  "w-full rounded-[12px] border border-[#1E2330] bg-[#0A0C10] px-3.5 py-2.5 text-[15px] text-[#F0F2F8] placeholder:text-[#4A5168] outline-none transition-colors focus:border-[#6C63FF]";
const labelClass = "mb-1.5 block text-[13px] text-[#8B92A5]";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

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
          Reset your password
        </p>

        {message && (
          <p className="mt-5 rounded-[12px] border border-[#00E5A0]/30 bg-[#00E5A0]/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#00E5A0]">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-[12px] border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#FF6B35]">
            {error}
          </p>
        )}

        <form
          action={forgotPassword}
          className="mt-5 space-y-4 rounded-[16px] border border-[#1E2330] bg-[#111318] p-6"
        >
          <p className="text-[13px] leading-relaxed text-[#8B92A5]">
            Enter the email you signed up with and we will send you a link to
            set a new password.
          </p>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-[12px] bg-[#6C63FF] px-3.5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#7C74FF]"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#8B92A5]">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-[#F0F2F8] underline underline-offset-4 transition-colors hover:text-[#6C63FF]"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
