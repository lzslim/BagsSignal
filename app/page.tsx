"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, Github, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { ClientWalletButton } from "@/components/wallet/ClientWalletButton";

const workflow = [
  ["01", "Launch on Bags", "A creator token starts generating fee, holder, and market activity."],
  ["02", "Track creator revenue", "BagsSignal reads claimable fees, lifetime earned, and token position context."],
  ["03", "Rank market momentum", "Volume, trades, revenue velocity, and metadata signals are turned into a creator leaderboard."],
  ["04", "Act with AI insight", "The advisor compresses the signal into short growth actions for the next creator move."]
];

const intelligenceLayers = [
  { label: "Revenue Lens", value: "claimable fees, lifetime earned, token fee flow" },
  { label: "Market Lens", value: "volume changes, trade velocity, token momentum" },
  { label: "Creator Lens", value: "identity, metadata quality, Bags token context" },
  { label: "AI Lens", value: "actionable recommendations instead of metric dumps" }
];

export default function HomePage() {
  return (
    <Suspense fallback={<HomeShell />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { connected } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewHome = searchParams.get("home") === "1";

  useEffect(() => {
    if (connected && !previewHome) router.push("/dashboard");
  }, [connected, previewHome, router]);

  return <HomeShell />;
}

function HomeShell() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(2,255,64,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(2,255,64,0.13),transparent_30rem),radial-gradient(circle_at_10%_78%,rgba(255,179,71,0.08),transparent_26rem)]" />

      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#08090b]/78 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/lzslim/BagsSignal"
              target="_blank"
              rel="noreferrer"
              aria-label="BagsSignal GitHub"
              className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.03] text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <ClientWalletButton />
          </div>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 pb-10 pt-28 sm:px-6 lg:pt-24">
        <div className="relative z-10 max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-brand/25 bg-brand/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Built for bags.fm creators
          </div>
          <h1 className="font-display max-w-5xl text-5xl font-semibold leading-[0.96] tracking-[0.01em] text-white md:text-7xl">
            Creator token intelligence, not another wallet dashboard.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">
            BagsSignal turns Bags fees, token performance, creator rankings, and AI recommendations into a command center for deciding what to claim, promote, and watch next.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 border border-brand/60 bg-brand/[0.14] px-5 text-sm font-semibold text-brand shadow-[0_0_28px_rgba(2,255,64,0.08)] transition hover:bg-brand hover:text-black"
            >
              Launch Creator Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex h-12 items-center justify-center gap-2 border border-white/15 bg-white/[0.045] px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/[0.08] hover:text-brand"
            >
              View Creator Leaderboard
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="border-y border-white/10 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.16em] text-muted lg:justify-start">
            {["Bags fees", "Token momentum", "Creator ranking", "AI recommendations", "Claim history"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-brand" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <div className="border-l border-brand/60 pl-4">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand">How it works</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">
                From token launch to creator action.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
                The homepage story mirrors the product: BagsSignal follows the creator token from launch data to revenue signal, then turns that signal into a concise next move.
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-[#0b0d10] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
            {workflow.map(([step, title, body]) => (
              <div key={step} className="grid gap-4 border-b border-white/10 p-5 last:border-b-0 sm:grid-cols-[72px_1fr]">
                <div className="font-mono text-sm text-brand">{step}</div>
                <div>
                  <div className="font-display text-lg font-semibold text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-muted">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {intelligenceLayers.map((layer) => (
            <div key={layer.label} className="border border-white/10 bg-black/20 p-5 transition hover:border-brand/35 hover:bg-brand/[0.035]">
              <Sparkles className="h-4 w-4 text-brand" />
              <div className="mt-4 font-display text-lg font-semibold text-white">{layer.label}</div>
              <div className="mt-3 text-sm leading-6 text-muted">{layer.value}</div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
