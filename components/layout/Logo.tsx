import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="BagsDash home">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand/40 bg-brand text-sm font-black text-black shadow-glow">
        B
      </span>
      <span className="font-display text-lg font-semibold tracking-[0.01em] text-white">BagsDash</span>
    </Link>
  );
}
