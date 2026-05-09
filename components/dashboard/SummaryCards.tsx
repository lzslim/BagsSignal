import { Coins, HandCoins, Sparkles, Users } from "lucide-react";
import type { DashboardSummary } from "@/lib/types";
import { formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

const items = (summary: DashboardSummary) => [
  {
    label: "Claimable Now",
    value: formatSOL(summary.totalClaimableSOL),
    hint: "Ready to claim",
    icon: HandCoins,
    accent: true
  },
  {
    label: "Lifetime Earned",
    value: formatSOL(summary.totalLifetimeEarnedSOL),
    hint: "Creator share",
    icon: Sparkles
  },
  {
    label: "Tracked Tokens",
    value: String(summary.tokenCount),
    hint: "Active positions",
    icon: Coins
  },
  {
    label: "Collaborators",
    value: String(summary.collaboratorCount),
    hint: "Fee claimers",
    icon: Users
  }
];

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items(summary).map((item) => {
        const Icon = item.icon;
        return (
          <Panel key={item.label} className="p-0">
            <div className="flex items-start justify-between p-5">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</div>
                <div className={`mt-3 font-mono text-3xl font-bold ${item.accent ? "text-brand" : "text-white"}`}>
                  {item.value}
                </div>
                <div className="mt-2 text-sm text-muted">{item.hint}</div>
              </div>
              <div className="rounded-lg border border-line bg-white/5 p-3">
                <Icon className={`h-5 w-5 ${item.accent ? "text-brand" : "text-muted"}`} />
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
