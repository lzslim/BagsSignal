import { Activity, Sparkles } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";
import { formatSOL } from "@/lib/utils";

export function AIMarketRead({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;

  const bullishCount = entries.filter((entry) => entry.aiRecommendation?.stance === "bullish").length;
  const cautiousCount = entries.filter((entry) => entry.aiRecommendation?.stance === "cautious" || entry.aiRecommendation?.stance === "risk").length;
  const totalVolume = entries.reduce((sum, entry) => sum + (entry.volume24hUsd ?? 0), 0);
  const claimable = entries.reduce((sum, entry) => sum + entry.claimableSOL, 0);
  const leader = entries[0];
  const read = bullishCount > cautiousCount
    ? "Current Bags activity is momentum-led: the strongest names combine visible trading with creator revenue, but the field is still concentrated in a few winners."
    : "Current Bags activity is selective: several tokens have revenue history, but many signals still need liquidity confirmation before they deserve high conviction.";

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-line bg-panel">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            AI Market Read
          </div>
          <p className="mt-4 max-w-4xl text-base leading-7 text-white">{read}</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/[0.04]">
              <Activity className="h-4 w-4 text-brand" />
            </div>
            <div>
              <span className="text-white">${leader.symbol}</span>
              <span> is the current signal leader by composite score.</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line bg-white/[0.025] sm:grid-cols-4 lg:grid-cols-2 lg:border-l lg:border-t-0">
          <Metric label="Bullish" value={String(bullishCount)} tone="text-brand" />
          <Metric label="Cautious" value={String(cautiousCount)} tone="text-warning" />
          <Metric label="Claimable" value={formatSOL(claimable)} tone="text-white" />
          <Metric label="24h Volume" value={`$${formatUsd(totalVolume)}`} tone="text-cyan" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="border-b border-r border-line p-4 last:border-r-0 sm:last:border-r lg:last:border-r lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0">
      <div className="text-xs uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className={`mt-2 font-mono text-lg font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function formatUsd(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}
