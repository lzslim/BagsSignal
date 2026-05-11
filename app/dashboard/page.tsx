"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, BarChart3, Coins, WalletCards } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TokenList } from "@/components/dashboard/TokenList";
import { EmptyCreatorState } from "@/components/dashboard/EmptyCreatorState";
import { AIAdvisorCard } from "@/components/ai/AIAdvisorCard";
import { ClaimNotice } from "@/components/shared/ClaimNotice";
import { ErrorState, LoadingState } from "@/components/shared/StateViews";
import { useClaim } from "@/hooks/useClaim";
import { useDashboard, useSampleDashboard } from "@/hooks/useDashboard";
import { useRedirectOnDisconnect } from "@/hooks/useRedirectOnDisconnect";
import { formatSOL } from "@/lib/utils";

export default function DashboardPage() {
  const { publicKey } = useWallet();
  useRedirectOnDisconnect();
  const [sampleMode, setSampleMode] = useState(false);
  const connectedWallet = publicKey?.toBase58() ?? null;
  const wallet = sampleMode ? null : connectedWallet;
  const { data: walletData, error, isLoading, mutate } = useDashboard(wallet);
  const sample = useSampleDashboard(sampleMode);
  const data = sampleMode ? sample.data : walletData;
  const loading = sampleMode ? sample.isLoading : isLoading;
  const loadError = sampleMode ? sample.error : error;
  const { claimOne } = useClaim();
  const [notice, setNotice] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({
    type: "idle"
  });

  async function handleClaimOne(mint: string) {
    if (sampleMode) {
      setNotice({ type: "error", message: "Sample creator data cannot be claimed." });
      return;
    }
    try {
      setNotice({ type: "loading", message: `Claiming fees for ${mint.slice(0, 4)}...` });
      const signatures = await claimOne(mint);
      setNotice({ type: "success", message: `Claim completed with ${signatures.length} confirmed transaction(s).` });
      void mutate();
    } catch (claimError) {
      setNotice({
        type: "error",
        message: claimError instanceof Error ? claimError.message : "Claim failed"
      });
    }
  }

  const hasCreatorData = Boolean(data && data.tokens.length > 0);
  const showDisconnectedState = Boolean(!connectedWallet && !sampleMode);
  const showEmptyCreatorState = Boolean(!sampleMode && !loading && !loadError && data && data.tokens.length === 0);

  return (
    <AppShell title="Creator dashboard">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025)_42%,rgba(2,255,64,0.055))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                <BarChart3 className="h-3.5 w-3.5" />
                Creator analytics
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-[0.01em] text-white sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
                Monitor claimable Bags fees, revenue momentum, and token-level creator positions from one polished operating view.
              </p>
            </div>
            {data && hasCreatorData ? (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[420px]">
                <div className="rounded-xl border border-brand/25 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    <WalletCards className="h-4 w-4 text-brand" />
                    Ready to claim
                  </div>
                  <div className="mt-3 font-mono text-2xl font-semibold leading-none text-brand">
                    {formatSOL(data.summary.totalClaimableSOL)}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    <Coins className="h-4 w-4 text-white/70" />
                    Token positions
                  </div>
                  <div className="mt-3 font-mono text-2xl font-semibold leading-none text-white">
                    {data.summary.tokenCount}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <ClaimNotice type={notice.type} message={notice.message} />

        {loading ? <LoadingState /> : null}
        {loadError ? <ErrorState message={loadError.message} /> : null}

        {showDisconnectedState ? (
          <EmptyCreatorState
            onSampleMode={() => setSampleMode(true)}
            title="Connect a wallet to view your creator dashboard"
            description="BagsSignal can show your personal Bags creator revenue after wallet connection. You can also open sample mode to review the real dashboard experience without connecting a wallet."
          />
        ) : null}

        {showEmptyCreatorState ? <EmptyCreatorState onSampleMode={() => setSampleMode(true)} /> : null}

        {data && hasCreatorData ? (
          <>
            {sampleMode ? (
              <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-orange-100 shadow-[0_18px_45px_rgba(0,0,0,0.16)] sm:flex-row sm:items-center sm:justify-between">
                <span className="leading-6">
                  Sample mode is active. You are viewing a realistic creator revenue walkthrough, not wallet-owned data.
                </span>
                <button
                  type="button"
                  onClick={() => setSampleMode(false)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/20 px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to wallet view
                </button>
              </div>
            ) : data.demoMode ? (
              <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6 text-orange-100 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
                Demo mode is active because `BAGS_API_KEY` is not configured. The UI is fully interactive, and real Bags data will appear once the API key is added.
              </div>
            ) : null}
            <SummaryCards summary={data.summary} />
            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.32fr)_minmax(360px,0.68fr)]">
              <div className="space-y-6">
                <TokenList tokens={data.tokens} onClaim={handleClaimOne} />
                <RevenueChart data={data.chart} />
              </div>
              <AIAdvisorCard />
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
