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
    insight.priority === "high" ? "border-brand/25" : insight.priority === "medium" ? "border-cyan/25" : "border-line";

  return (
    <div className={`rounded-lg border ${priorityClass} bg-white/[0.02] p-4`}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-line bg-white/5 p-2">
          <Icon className="h-4 w-4 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">{insight.title}</div>
          <div className="mt-2 text-sm leading-6 text-muted">{insight.body}</div>
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
