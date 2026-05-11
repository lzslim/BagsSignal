"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, BarChart3, CircleAlert, ExternalLink, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { SimulationWalletPicker } from "@/components/dashboard/SimulationWalletPicker";
import { Panel } from "@/components/shared/Panel";
import { ErrorState, LoadingState } from "@/components/shared/StateViews";
import { useRedirectOnDisconnect } from "@/hooks/useRedirectOnDisconnect";
import type { ClaimHistoryResponse } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";

const SIMULATED_WALLET_KEY = "bagssignal.simulatedWallet";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json as ClaimHistoryResponse;
};

export default function HistoryPage() {
  const { publicKey } = useWallet();
  const [sampleMode, setSampleMode] = useState(false);
  const [sampleWallet, setSampleWallet] = useState<string | null>(null);
  useRedirectOnDisconnect();
  const wallet = publicKey?.toBase58();
  const historyUrl = sampleMode
    ? `/api/claim/history/sample${sampleWallet ? `?wallet=${encodeURIComponent(sampleWallet)}` : ""}`
    : wallet
      ? `/api/claim/history?wallet=${wallet}`
      : null;
  const { data, error, isLoading } = useSWR<ClaimHistoryResponse>(
    historyUrl,
    fetcher
  );
  const hasEvents = Boolean(data?.events.length);
  const showDisconnectedState = Boolean(!wallet && !sampleMode);

  useEffect(() => {
    if (wallet) return;
    const storedWallet = window.sessionStorage.getItem(SIMULATED_WALLET_KEY);
    if (!storedWallet) return;
    setSampleWallet(storedWallet);
    setSampleMode(true);
  }, [wallet]);

  function handleSimulateWallet(walletAddress: string) {
    window.sessionStorage.setItem(SIMULATED_WALLET_KEY, walletAddress);
    setSampleWallet(walletAddress);
    setSampleMode(true);
  }

  function handleBackToWalletView() {
    window.sessionStorage.removeItem(SIMULATED_WALLET_KEY);
    setSampleWallet(null);
    setSampleMode(false);
  }

  return (
    <AppShell title="Claim history">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[0.01em]">Claim history</h1>
            <p className="mt-2 text-sm text-muted">
              Review confirmed claim activity across Bags tokens linked to the active wallet.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {sampleMode ? (
              <button
                type="button"
                onClick={handleBackToWalletView}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to wallet view
              </button>
            ) : null}
          </div>
        </div>

        {sampleMode ? (
          <div className="rounded-lg border border-brand/25 bg-brand/10 px-5 py-4 text-sm leading-6 text-brand">
            Sample mode is active. You are viewing a realistic claim history walkthrough, not wallet-owned data.
            {sampleWallet ? ` Simulated wallet: ${sampleWallet.slice(0, 6)}...${sampleWallet.slice(-4)}.` : ""}
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading claim history..." /> : null}
        {error ? <ErrorState message={error.message} /> : null}

        {showDisconnectedState ? (
          <EmptyHistoryState
            onSampleMode={() => setSampleMode(true)}
            onSimulateWallet={handleSimulateWallet}
            title="Connect a wallet to view claim history"
            description="BagsSignal can show fee claim history after wallet connection. You can also open sample mode to inspect the history experience without connecting a wallet."
          />
        ) : null}

        {!isLoading && !error && data && !hasEvents && !sampleMode ? (
          <EmptyHistoryState onSampleMode={() => setSampleMode(true)} onSimulateWallet={handleSimulateWallet} />
        ) : null}

        {data && hasEvents ? (
          <Panel className="overflow-hidden p-0">
            <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr] border-b border-line px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted">
              <span>Token</span>
              <span>Amount</span>
              <span>Time</span>
              <span>Transaction</span>
            </div>
            {data.events.map((event) => (
              <div key={event.txHash} className="grid grid-cols-1 gap-3 border-b border-line px-5 py-4 text-sm last:border-b-0 md:grid-cols-[1.2fr_0.8fr_1fr_0.8fr]">
                <span className="font-mono text-white">{formatAddress(event.mint, 6, 6)}</span>
                <span className="font-mono text-brand">{formatSOL(event.amountSOL)}</span>
                <span className="text-muted">{new Date(event.timestamp).toLocaleString("en-US")}</span>
                <a href={event.solscanUrl} target="_blank" rel="noreferrer" className="font-mono text-brand">
                  {formatAddress(event.txHash, 6, 6)}
                </a>
              </div>
            ))}
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}

function EmptyHistoryState({
  onSampleMode,
  onSimulateWallet,
  title = "No Bags activity found for this wallet",
  description = "This wallet does not have Bags creator revenue or claim history yet. Use sample mode to review the full claim, token, revenue, and advisor experience without tying it to the connected wallet."
}: {
  onSampleMode: () => void;
  onSimulateWallet?: (wallet: string) => void;
  title?: string;
  description?: string;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="px-6 py-10 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 text-brand">
            <CircleAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-[0.01em] text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onSampleMode}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <FlaskConical className="h-4 w-4" />
              View sample mode
            </button>
            <Link
              href="/leaderboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              <BarChart3 className="h-4 w-4" />
              Explore leaderboard
            </Link>
            <a
              href="https://bags.fm"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              Launch on Bags
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {onSimulateWallet ? <SimulationWalletPicker onSelect={onSimulateWallet} /> : null}
        </div>
      </div>
    </Panel>
  );
}
