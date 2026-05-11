"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { InsightCard } from "@/components/ai/InsightCard";
import { Panel } from "@/components/shared/Panel";
import type { InsightCard as InsightCardType } from "@/lib/types";

const STREAM_CHARS_PER_TICK = 4;
const STREAM_TICK_MS = 70;

function pickNextScenario(current: number, playbookLength: number) {
  if (playbookLength <= 1) return 0;
  let next = Math.floor(Math.random() * playbookLength);
  if (next === current) next = (next + 1) % playbookLength;
  return next;
}

function revealInsights(insights: InsightCardType[], progress: number) {
  let remaining = progress;
  return insights.flatMap((insight) => {
    if (remaining <= 0) return [];

    const body = insight.body.slice(0, remaining);
    remaining -= insight.body.length;
    return [{ ...insight, body }];
  });
}

export function AIAdvisorCard() {
  const [playbook, setPlaybook] = useState<InsightCardType[][]>([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [streamProgress, setStreamProgress] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const activeInsights = playbook[scenarioIndex] ?? [];
  const totalCharacters = useMemo(
    () => activeInsights.reduce((sum, insight) => sum + insight.body.length, 0),
    [activeInsights]
  );
  const isStreaming = streamProgress < totalCharacters;
  const visibleInsights = isStreaming ? revealInsights(activeInsights, streamProgress) : activeInsights;

  useEffect(() => {
    let cancelled = false;

    async function loadPlaybook() {
      try {
        const response = await fetch("/api/ai/advisor-playbook");
        if (!response.ok) {
          if (!cancelled) setLoadError(true);
          return;
        }
        const payload = await response.json() as { scenarios?: InsightCardType[][] };
        if (!cancelled && payload.scenarios?.length) {
          setPlaybook(payload.scenarios);
          setScenarioIndex(0);
          setStreamProgress(0);
        } else if (!cancelled) {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    }

    void loadPlaybook();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return undefined;

    const timer = window.setInterval(() => {
      setStreamProgress((current) => Math.min(totalCharacters, current + STREAM_CHARS_PER_TICK));
    }, STREAM_TICK_MS);

    return () => window.clearInterval(timer);
  }, [isStreaming, totalCharacters]);

  function handleRefresh() {
    if (playbook.length === 0) return;
    const next = pickNextScenario(scenarioIndex, playbook.length);
    setScenarioIndex(next);
    setStreamProgress(0);
  }

  return (
    <Panel className="h-fit overflow-hidden p-0 2xl:sticky 2xl:top-24">
      <div className="border-b border-white/10 bg-white/[0.025] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display flex items-center gap-2 text-xl font-semibold tracking-[0.01em] text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand/25 bg-brand/10">
                <Sparkles className="h-4 w-4 text-brand" />
              </span>
              AI Revenue Advisor
            </div>
            <div className="mt-2 text-sm leading-6 text-muted">
              Wallet-level actions based on creator revenue, claimable fees, and token momentum.
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={playbook.length === 0}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStreaming ? "animate-spin text-brand" : ""}`} />
            {playbook.length === 0 ? "Loading" : isStreaming ? "Thinking" : "Refresh"}
          </button>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {playbook.length === 0 && !loadError ? (
          <AdvisorLoadingState />
        ) : null}
        {loadError ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-orange-100">
            Advisor playbook is unavailable. Check the dashboard advisor database table and seed data.
          </div>
        ) : null}
        {visibleInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </div>
    </Panel>
  );
}

function AdvisorLoadingState() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="h-3 w-24 rounded-full bg-white/10" />
          <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-3 w-3/4 rounded-full bg-white/10" />
        </div>
      ))}
    </>
  );
}
