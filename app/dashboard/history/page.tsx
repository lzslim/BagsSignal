"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/shared/Panel";
import { ErrorState, LoadingState } from "@/components/shared/StateViews";
import { useRedirectOnDisconnect } from "@/hooks/useRedirectOnDisconnect";
import { mockWallet } from "@/lib/mock";
import type { ClaimEvent } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";

type HistoryResponse = {
  events: ClaimEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json as HistoryResponse;
};

export default function HistoryPage() {
  const { publicKey } = useWallet();
  useRedirectOnDisconnect();
  const wallet = publicKey?.toBase58() ?? mockWallet;
  const { data, error, isLoading } = useSWR<HistoryResponse>(
    wallet ? `/api/claim/history?wallet=${wallet}` : null,
    fetcher
  );

  return (
    <AppShell title="Claim history">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[0.01em]">Claim history</h1>
          <p className="mt-2 text-sm text-muted">
            Review your confirmed claim events across every Bags token linked to this wallet.
          </p>
        </div>

        {isLoading ? <LoadingState label="Loading claim history..." /> : null}
        {error ? <ErrorState message={error.message} /> : null}

        {data ? (
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
