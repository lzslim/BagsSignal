import Link from "next/link";

export function Logo() {
  return (
    <Link href="/?home=1" className="flex items-center gap-3" aria-label="BagsSignal home">
      <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-brand/35 bg-black shadow-[0_0_24px_rgba(2,255,64,0.18)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/bagssignal-logo.png" alt="" className="h-full w-full object-cover" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-semibold tracking-[0.01em] text-white">BagsSignal</span>
    </Link>
  );
}
