"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Sparkles, Target, TrendingUp } from "lucide-react";
import type { InsightCard as InsightCardType } from "@/lib/types";

const iconMap = {
  Sparkles,
  TrendingUp,
  Target,
  Gauge
};

export function InsightCard({ insight }: { insight: InsightCardType }) {
  const Icon = iconMap[insight.icon as keyof typeof iconMap] ?? Sparkles;
  const priorityClass =
    insight.priority === "high" ? "border-brand/30 bg-brand/[0.045]" : insight.priority === "medium" ? "border-cyan/25 bg-cyan/[0.035]" : "border-white/10 bg-white/[0.025]";
  const priorityLabel = insight.priority === "high" ? "High priority" : insight.priority === "medium" ? "Watch closely" : "Monitor";

  return (
    <div className={`rounded-xl border ${priorityClass} p-4 transition hover:border-white/20`}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
          <Icon className="h-4 w-4 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-white">{insight.title}</div>
            <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
              {priorityLabel}
            </span>
          </div>
          <div className="mt-3 text-sm leading-6 text-muted">{insight.body}</div>
          {insight.actionLabel && insight.actionRoute ? (
            <Link href={insight.actionRoute} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
              {insight.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
