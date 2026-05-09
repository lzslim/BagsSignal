"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, ExternalLink, Lightbulb, ShieldAlert } from "lucide-react";
import type { LeaderboardEntry, TokenAIRecommendation } from "@/lib/types";
import {
  creatorProviderIconPath,
  creatorProviderLabel,
  formatAddress,
  formatSOL,
  isKnownCreatorProvider,
  tokenFallbackDataUrl
} from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

const signalStyles = {
  bullish: "border-brand/30 bg-brand/10 text-brand shadow-[0_0_18px_rgba(2,255,64,0.08)]",
  watch: "border-cyan/30 bg-cyan/10 text-cyan shadow-[0_0_18px_rgba(56,189,248,0.08)]",
  cautious: "border-warning/30 bg-warning/10 text-warning shadow-[0_0_18px_rgba(251,191,36,0.08)]",
  risk: "border-red-400/30 bg-red-400/10 text-red-200 shadow-[0_0_18px_rgba(248,113,113,0.08)]"
};

const signalLabels = {
  bullish: "Bullish",
  watch: "Watch",
  cautious: "Cautious",
  risk: "Risk"
};

const confidenceLabels = {
  high: "Strong Signal",
  medium: "Developing Signal",
  low: "Needs More Data"
};

export function LeaderboardTable({
  entries,
  showingLabel,
  page,
  totalPages,
  onPageChange,
  demoMode
}: {
  entries: LeaderboardEntry[];
  showingLabel: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  demoMode?: boolean;
}) {
  const [expandedMint, setExpandedMint] = useState<string | null>(null);

  return (
    <Panel className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Token</th>
              <th className="px-5 py-4">Creator</th>
              <th className="px-5 py-4">AI Signal</th>
              <th className="px-5 py-4">CA</th>
              <th className="px-5 py-4">Lifetime Earned</th>
              <th className="px-5 py-4">Claimable Now</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Link</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-sm text-muted">
                  No creators found matching your search.
                </td>
              </tr>
            ) : null}
            {entries.map((entry) => {
              const hasKnownCreator = isKnownCreatorProvider(entry.creatorProvider) && Boolean(entry.creatorUsername);
              const creatorHandle = entry.creatorUsername?.replace(/^@/, "");
              const providerIcon = creatorProviderIconPath(entry.creatorProvider);
              const providerLabel = creatorProviderLabel(entry.creatorProvider);
              const tokenImage = entry.imageUrl || tokenFallbackDataUrl(entry.mint, entry.symbol);
              const isExpanded = expandedMint === entry.mint;

              return (
                <>
                  <tr
                    key={`${entry.rank}-${entry.mint}`}
                    className={`border-b border-white/5 transition hover:bg-panelHover ${entry.isMe ? "bg-brand/5" : ""}`}
                  >
                    <td className="px-5 py-4 font-mono text-sm text-muted">
                      {entry.rank <= 3 ? ["#1", "#2", "#3"][entry.rank - 1] : `#${entry.rank}`}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tokenImage} alt={entry.symbol} className="h-10 w-10 rounded-lg border border-line object-cover" />
                        <div>
                          <div className="font-medium text-white">
                            ${entry.symbol}
                            {(entry.momentumScore ?? 0) >= 0.65 ? <span className="ml-2">🔥</span> : null}
                          </div>
                          {entry.name ? <div className="text-xs text-muted">{entry.name}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[9rem]">
                        <div className="font-medium text-white">
                          {hasKnownCreator && creatorHandle && entry.creatorUrl ? (
                            <a href={entry.creatorUrl} target="_blank" rel="noreferrer" className="hover:text-brand">
                              @{creatorHandle}
                            </a>
                          ) : hasKnownCreator && creatorHandle ? (
                            `@${creatorHandle}`
                          ) : (
                            entry.creatorWalletShort
                          )}
                          {entry.isMe ? <span className="ml-2 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs text-brand">You</span> : null}
                        </div>
                        {hasKnownCreator && providerIcon ? (
                          <div className="mt-1.5 flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={providerIcon}
                              alt={providerLabel ?? "Creator platform"}
                              title={providerLabel ?? "Creator platform"}
                              className="h-4 w-4 opacity-80 transition hover:opacity-100"
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <AISignalButton
                        recommendation={entry.aiRecommendation}
                        expanded={isExpanded}
                        onClick={() => setExpandedMint(isExpanded ? null : entry.mint)}
                      />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{formatAddress(entry.mint, 6, 6)}</td>
                    <td className="px-5 py-4 font-mono text-white">{formatSOL(entry.lifetimeEarnedSOL)}</td>
                    <td className="px-5 py-4 font-mono text-brand">{entry.claimableSOL > 0 ? formatSOL(entry.claimableSOL) : "-"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                        {entry.isGraduated ? "Graduated" : "Bonding Curve"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {!demoMode ? (
                        <a
                          href={`https://bags.fm/${entry.mint}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-xs text-white transition hover:border-brand/40 hover:bg-brand/10"
                        >
                          Bags
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && entry.aiRecommendation ? (
                    <tr key={`${entry.mint}-ai`} className="border-b border-white/5 bg-white/[0.025]">
                      <td colSpan={9} className="px-5 py-4">
                        <AIRecommendationPanel recommendation={entry.aiRecommendation} />
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{showingLabel}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Previous
          </button>
          <span>{page} / {totalPages}</span>
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}

function AISignalButton({
  recommendation,
  expanded,
  onClick
}: {
  recommendation?: TokenAIRecommendation | null;
  expanded: boolean;
  onClick: () => void;
}) {
  if (!recommendation) {
    return <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">Pending</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`group inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:-translate-y-px hover:brightness-110 ${signalStyles[recommendation.stance]} ${expanded ? "ring-1 ring-white/20" : ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {signalLabels[recommendation.stance]}
      <span className="hidden text-[10px] font-medium opacity-75 xl:inline">{expanded ? "Hide" : "Details"}</span>
      <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
    </button>
  );
}

function AIRecommendationPanel({ recommendation }: { recommendation: TokenAIRecommendation }) {
  const evidence = recommendation.evidence;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${signalStyles[recommendation.stance]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {signalLabels[recommendation.stance]}
            </span>
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted">
              {confidenceLabels[recommendation.confidence]}
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand/25 bg-brand/10">
              <Lightbulb className="h-4 w-4 text-brand" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-[0.01em] text-white">{recommendation.title}</div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{recommendation.insight}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3 rounded-lg border border-line bg-white/[0.025] p-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
              <ArrowUpRight className="h-4 w-4 text-cyan" />
            </div>
            <div className="text-sm leading-6 text-white">
              <span className="text-muted">Action: </span>
              {recommendation.action}
            </div>
          </div>
        </div>
        <div className="border-t border-line bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
            <ShieldAlert className="h-3.5 w-3.5" />
            Evidence
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <EvidenceMetric label="24h Volume" value={`$${formatUsd(evidence.volume24hUsd)}`} />
            <EvidenceMetric label="Trades" value={String(evidence.tradeCount24h)} />
            <EvidenceMetric label="Claimable" value={formatSOL(evidence.claimableSOL)} />
            <EvidenceMetric label="Momentum" value={evidence.momentumScore.toFixed(2)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function formatUsd(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}
