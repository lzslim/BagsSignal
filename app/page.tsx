"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowRight, Bot, Github, RadioTower, ScanLine, ShieldCheck, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

const tokenSignals = [
  { symbol: "AGENT", change: "+38.4%", revenue: "12.73 SOL", status: "Push now" },
  { symbol: "HIVE", change: "+17.8%", revenue: "0.34 SOL", status: "Watch flow" },
  { symbol: "GODMODE", change: "+9.6%", revenue: "0.95 SOL", status: "Claim window" }
];

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
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:pt-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 border border-brand/25 bg-brand/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Built for bags.fm creators
          </div>
          <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[0.01em] text-white md:text-7xl">
            Creator token intelligence, not another wallet dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            BagsSignal turns Bags fees, token performance, creator rankings, and AI recommendations into a command center for deciding what to claim, promote, and watch next.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Launch Creator Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex h-12 items-center justify-center gap-2 border border-white/12 bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              View Creator Leaderboard
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-1 border border-white/10 bg-black/25 sm:grid-cols-3">
            {[
              ["100", "tracked tokens"],
              ["AI", "growth signals"],
              ["SOL", "creator revenue"]
            ].map(([value, label]) => (
              <div key={label} className="border-b border-white/10 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <div className="font-mono text-2xl font-semibold text-brand">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border border-white/10 bg-[#0b0d10] shadow-[0_28px_110px_rgba(0,0,0,0.42)]">
          <div className="absolute -inset-px bg-gradient-to-r from-brand/30 via-transparent to-warning/20 opacity-60" />
          <div className="relative bg-[#0b0d10]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
                <RadioTower className="h-4 w-4 text-brand" />
                Live creator signal
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2 w-2 bg-brand shadow-[0_0_18px_rgba(2,255,64,0.65)]" />
                mainnet feed
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
              <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-sm text-muted">Claimable creator revenue</div>
                    <div className="mt-2 font-mono text-4xl font-semibold text-brand">14.138 SOL</div>
                  </div>
                  <div className="w-fit border border-brand/25 bg-brand/[0.08] px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-brand">
                    claim window detected
                  </div>
                </div>

                <div className="mt-6 h-28 border border-white/10 bg-black/25 p-3">
                  <div className="flex h-full items-end gap-2">
                    {[24, 42, 35, 58, 46, 72, 64, 88, 70, 96, 82, 104].map((height, index) => (
                      <div key={index} className="flex flex-1 flex-col justify-end">
                        <div
                          className="bg-gradient-to-t from-brand/25 to-brand"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Bot className="h-4 w-4 text-brand" />
                  AI action
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Push the token with active trades before claiming. Capture the spike, then reset the revenue baseline.
                </p>
                <div className="mt-4 border border-white/10 bg-black/25 p-3 font-mono text-xs uppercase tracking-[0.12em] text-warning">
                  Confidence: strong signal
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/10 border-t border-white/10">
              {tokenSignals.map((token) => (
                <div key={token.symbol} className="grid grid-cols-2 gap-3 px-4 py-3 text-sm sm:grid-cols-[90px_1fr_110px_120px]">
                  <div className="font-mono font-semibold text-white">{token.symbol}</div>
                  <div className="flex items-center gap-2 text-muted">
                    <TrendingUp className="h-4 w-4 text-brand" />
                    24h signal {token.change}
                  </div>
                  <div className="font-mono text-brand">{token.revenue}</div>
                  <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{token.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="border-y border-white/10 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {["Bags fees", "Token momentum", "Creator ranking", "AI recommendations", "Claim history"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-brand" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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

          <div className="border border-white/10 bg-[#0b0d10]">
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

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {intelligenceLayers.map((layer) => (
            <div key={layer.label} className="border border-white/10 bg-black/20 p-5 transition hover:border-brand/35 hover:bg-brand/[0.035]">
              <Sparkles className="h-4 w-4 text-brand" />
              <div className="mt-4 font-display text-lg font-semibold text-white">{layer.label}</div>
              <div className="mt-3 text-sm leading-6 text-muted">{layer.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 border border-brand/20 bg-[linear-gradient(90deg,rgba(2,255,64,0.1),rgba(255,255,255,0.025))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand">Hackathon demo ready</div>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">Open the full Bags creator console.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Review dashboard, leaderboard, claim history, and AI insight flows without changing the underlying app routes.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Launch Creator Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
