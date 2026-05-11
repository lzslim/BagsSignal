"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimNotice } from "@/components/shared/ClaimNotice";
import { Panel } from "@/components/shared/Panel";
import { ErrorState, LoadingState } from "@/components/shared/StateViews";
import { ClaimTimeline } from "@/components/token/ClaimTimeline";
import { FeeShareTable } from "@/components/token/FeeShareTable";
import { TokenInsights } from "@/components/ai/TokenInsights";
import { useClaim } from "@/hooks/useClaim";
import { useRedirectOnDisconnect } from "@/hooks/useRedirectOnDisconnect";
import { useTokenDetail } from "@/hooks/useTokenDetail";
import { useTokenInsights } from "@/hooks/useTokenInsights";
import { SOLSCAN_BASE } from "@/lib/constants";
import { formatAddress, formatSOL } from "@/lib/utils";

export default function TokenDetailPage() {
  const params = useParams<{ mint: string }>();
  const { publicKey } = useWallet();
  useRedirectOnDisconnect();
  const wallet = publicKey?.toBase58() ?? null;
  const { data, error, isLoading, mutate } = useTokenDetail(params.mint, wallet);
  const insights = useTokenInsights(publicKey?.toBase58() ?? null, data);
  const { claimOne, isClaiming } = useClaim();
  const [notice, setNotice] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({
    type: "idle"
  });

  async function handleClaim() {
    if (!data) return;
    try {
      setNotice({ type: "loading", message: "Sending claim transaction..." });
      const signatures = await claimOne(data.mint);
      setNotice({ type: "success", message: `Claim completed with ${signatures.length} confirmed transaction(s).` });
      void mutate();
    } catch (claimError) {
      setNotice({
        type: "error",
        message: claimError instanceof Error ? claimError.message : "Claim failed"
      });
    }
  }

  return (
    <AppShell title="Token detail">
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Link href="/dashboard" className="inline-flex items-center gap-2 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span>/</span>
          <span>{data?.symbol ?? "Token"}</span>
        </div>

        <ClaimNotice type={notice.type} message={notice.message} />

        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={error.message} /> : null}

        {data ? (
          <>
            <Panel>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-lg border border-brand/30 bg-brand/10 text-xl font-semibold text-brand">
                    {data.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <h1 className="font-display text-3xl font-semibold tracking-[0.01em]">{data.symbol}</h1>
                    <div className="mt-1 text-muted">{data.name}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span className="font-mono">{formatAddress(data.mint, 8, 8)}</span>
                      <a href={`${SOLSCAN_BASE}/token/${data.mint}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand">
                        View on Solscan
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-line px-3 py-2 text-sm text-muted">
                    {data.isMigrated ? "Graduated" : "Bonding curve"}
                  </span>
                  <span className="rounded-full border border-line px-3 py-2 text-sm text-muted">{data.feeMode} fee vault</span>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Panel>
                <div className="text-sm text-muted">Claimable now</div>
                <div className="mt-3 font-mono text-3xl font-bold text-brand">{formatSOL(data.claimableSOL)}</div>
                <div className="mt-2 text-sm text-muted">Available to your connected wallet.</div>
              </Panel>
              <Panel>
                <div className="text-sm text-muted">Lifetime earned</div>
                <div className="mt-3 font-mono text-3xl font-bold text-white">{formatSOL(data.lifetimeEarnedSOL)}</div>
                <div className="mt-2 text-sm text-muted">Estimated creator share across all time.</div>
              </Panel>
              <Panel>
                <div className="text-sm text-muted">Total token fees</div>
                <div className="mt-3 font-mono text-3xl font-bold text-white">{formatSOL(data.lifetimeTotalSOL)}</div>
                <div className="mt-2 text-sm text-muted">Gross fee volume generated by this token.</div>
              </Panel>
            </div>

            <FeeShareTable creators={data.creators} />
            <TokenInsights
              symbol={data.symbol}
              data={insights.data}
              loading={insights.isLoading}
              error={insights.error?.message}
              onRefresh={() => void insights.mutate()}
            />
            <ClaimTimeline events={data.claimHistory} />

            <div className="sticky bottom-4">
              <div className="rounded-lg border border-line bg-panel/95 p-4 backdrop-blur-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-muted">Claimable balance</div>
                    <div className="mt-1 font-mono text-xl font-semibold text-brand">{formatSOL(data.claimableSOL)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isClaiming ? "Claiming..." : "Claim now"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
