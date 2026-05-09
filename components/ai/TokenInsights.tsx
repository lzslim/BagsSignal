"use client";

import { Sparkles } from "lucide-react";
import { InsightCard } from "@/components/ai/InsightCard";
import { Panel } from "@/components/shared/Panel";
import type { AIInsightsResponse } from "@/lib/types";

export function TokenInsights({
  symbol,
  data,
  loading,
  error,
  onRefresh
}: {
  symbol: string;
  data?: AIInsightsResponse;
  loading: boolean;
  error?: string;
  onRefresh: () => void;
}) {
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-display flex items-center gap-2 text-lg font-semibold tracking-[0.01em] text-white">
            <Sparkles className="h-5 w-5 text-brand" />
            AI Insights for ${symbol}
          </div>
          <div className="mt-1 text-sm text-muted">Personalized suggestions based on this token&apos;s on-chain data.</div>
        </div>
        <button type="button" onClick={onRefresh} className="rounded-lg border border-line px-3 py-2 text-xs text-muted">
          Refresh
        </button>
      </div>
      {loading ? <div className="text-sm text-muted">Generating insights...</div> : null}
      {error ? <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-red-100">Unable to load token insights.</div> : null}
      <div className="space-y-3">
        {data?.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </div>
    </Panel>
  );
}
