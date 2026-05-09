"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft } from "lucide-react";
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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[0.01em]">Creator dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Review claimable Bags fees, collaborator splits, and recent revenue changes across your creator tokens.
            </p>
          </div>
          {data && hasCreatorData ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-line px-4 py-3 text-sm text-muted">
                Total ready to claim: <span className="font-mono text-brand">{formatSOL(data.summary.totalClaimableSOL)}</span>
              </div>
            </div>
          ) : null}
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
              <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-orange-100 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Sample mode is active. You are viewing a realistic creator revenue walkthrough, not wallet-owned data.
                </span>
                <button
                  type="button"
                  onClick={() => setSampleMode(false)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to wallet view
                </button>
              </div>
            ) : data.demoMode ? (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-orange-100">
                Demo mode is active because `BAGS_API_KEY` is not configured. The UI is fully interactive, and real Bags data will appear once the API key is added.
              </div>
            ) : null}
            <SummaryCards summary={data.summary} />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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
