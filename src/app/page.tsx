import Link from "next/link";

const VALUE_PROPS = [
  "Real-time market data",
  "Smart saving pods",
  "AI that watches for you",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0C10] px-4">
      {/* Vault Glow behind the hero headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C63FF] opacity-20 blur-[130px]"
      />

      <div className="relative w-full max-w-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8B92A5]">
          Vault<span className="text-[#6C63FF]">Point</span>
        </p>

        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-[#F0F2F8]">
          Track Every Market.
          <br />
          Grow Every Goal.
        </h1>

        <ul className="mx-auto mt-8 w-fit space-y-3 text-left">
          {VALUE_PROPS.map((prop) => (
            <li
              key={prop}
              className="flex items-center gap-3 text-[15px] text-[#8B92A5]"
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rotate-45 bg-[#6C63FF]"
              />
              {prop}
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-4">
          <Link
            href="/signup"
            className="block w-full rounded-[12px] bg-[#6C63FF] px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#7C74FF]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="block text-sm text-[#8B92A5] transition-colors hover:text-[#F0F2F8]"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}
