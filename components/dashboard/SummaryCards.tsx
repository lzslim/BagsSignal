import { Coins, HandCoins, Sparkles, Users } from "lucide-react";
import type { DashboardSummary } from "@/lib/types";
import { formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

const items = (summary: DashboardSummary) => [
  {
    label: "Claimable Now",
    value: formatSOL(summary.totalClaimableSOL),
    hint: "Available creator fees",
    icon: HandCoins,
    accent: true
  },
  {
    label: "Lifetime Earned",
    value: formatSOL(summary.totalLifetimeEarnedSOL),
    hint: "Collected revenue",
    icon: Sparkles
  },
  {
    label: "Tracked Tokens",
    value: String(summary.tokenCount),
    hint: "Creator positions",
    icon: Coins
  },
  {
    label: "Collaborators",
    value: String(summary.collaboratorCount),
    hint: "Revenue partners",
    icon: Users
  }
];

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items(summary).map((item) => {
        const Icon = item.icon;
        return (
          <Panel
            key={item.label}
            className={`group overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-panelHover ${item.accent ? "border-brand/25 bg-brand/[0.045]" : ""}`}
          >
            <div className="relative p-5">
              {item.accent ? <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" /> : null}
              <div className="relative min-h-[132px]">
                <div className="min-w-0 pr-14">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{item.label}</div>
                  <div className={`mt-3 whitespace-nowrap font-mono text-[clamp(1.45rem,2vw,1.82rem)] font-semibold leading-none ${item.accent ? "text-brand" : "text-white"}`}>
                    {item.value}
                  </div>
                  <div className="mt-3 text-sm text-muted">{item.hint}</div>
                </div>
                <div className={`absolute right-0 top-0 rounded-xl border p-3 transition group-hover:scale-105 ${item.accent ? "border-brand/25 bg-brand/10" : "border-white/10 bg-white/[0.04]"}`}>
                  <Icon className={`h-5 w-5 ${item.accent ? "text-brand" : "text-white/70"}`} />
                </div>
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
