"use client";

import { Sparkles } from "lucide-react";
import { InsightCard } from "@/components/ai/InsightCard";
import { Panel } from "@/components/shared/Panel";
import { AIInsightsResponse } from "@/lib/types";

export function AIAdvisorCard({
  data,
  loading,
  error,
  onRefresh
}: {
  data?: AIInsightsResponse;
  loading: boolean;
  error?: string;
  onRefresh: () => void;
}) {
  return (
    <Panel className="h-fit">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-display flex items-center gap-2 text-lg font-semibold tracking-[0.01em] text-white">
            <Sparkles className="h-5 w-5 text-brand" />
            AI Revenue Advisor
          </div>
          <div className="mt-1 text-sm text-muted">
            Powered by {data?.provider ?? "AI provider"}
            {data?.demoMode ? " in demo mode" : ""}
          </div>
        </div>
        <button type="button" onClick={onRefresh} className="rounded-lg border border-line px-3 py-2 text-xs text-muted">
          Refresh
        </button>
      </div>
      {loading ? <div className="text-sm text-muted">Generating insights...</div> : null}
      {error ? <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-red-100">Unable to load AI insights.</div> : null}
      <div className="space-y-3">
        {data?.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </div>
      {data?.generatedAt ? (
        <div className="mt-4 text-xs text-muted">Last updated: {new Date(data.generatedAt).toLocaleTimeString("en-US")}</div>
      ) : null}
    </Panel>
  );
}
