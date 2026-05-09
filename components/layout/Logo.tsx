import Link from "next/link";

export function Logo() {
  return (
    <Link href="/?home=1" className="flex items-center gap-3" aria-label="BagsSignal home">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand/40 bg-brand text-sm font-black text-black shadow-glow">
        B
      </span>
      <span className="font-display text-lg font-semibold tracking-[0.01em] text-white">BagsSignal</span>
    </Link>
  );
}
