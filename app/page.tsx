"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowRight, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

export default function HomePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewHome = searchParams.get("home") === "1";

  useEffect(() => {
    if (connected && !previewHome) router.push("/dashboard");
  }, [connected, previewHome, router]);

  return (
    <main className="grid-bg min-h-screen bg-ink">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-ink/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/lzslim/BagsSignal"
              target="_blank"
              rel="noreferrer"
              aria-label="BagsSignal GitHub"
              className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pb-20 pt-24 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          Bags Hackathon 2026
        </div>
        <h1 className="font-display max-w-4xl text-5xl font-bold tracking-[0.01em] text-white md:text-7xl">
          Creator Revenue Signals for Bags
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          BagsSignal turns Bags token fees, creator revenue, trading momentum, and AI-ready market data into a focused workspace for creators and reviewers.
        </p>
        <Link
          href="/leaderboard"
          className="mt-9 inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Explore live leaderboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-14 grid w-full max-w-3xl grid-cols-1 divide-y divide-line rounded-lg border border-line bg-panel/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["1K+", "Creators"],
            ["3.2K", "Tokens Tracked"],
            ["125K SOL", "Fees Claimed"]
          ].map(([value, label]) => (
            <div key={label} className="p-5">
              <div className="font-mono text-2xl font-bold text-brand">{value}</div>
              <div className="mt-1 text-xs uppercase text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
