import type { Creator } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

export function FeeShareTable({ creators }: { creators: Creator[] }) {
  return (
    <Panel>
      <div className="mb-4">
        <div className="font-display text-lg font-semibold tracking-[0.01em]">Fee share configuration</div>
        <div className="text-sm text-muted">Every fee claimer attached to this token.</div>
      </div>
      <div className="space-y-3">
        {creators.map((creator) => (
          <div
            key={creator.wallet}
            className={`rounded-lg border px-4 py-4 ${creator.isMe ? "border-brand/30 bg-brand/10" : "border-line bg-white/[0.02]"}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-white">
                  {creator.providerUsername ?? creator.username ?? formatAddress(creator.wallet, 6, 6)}
                </div>
                <div className="mt-1 font-mono text-xs text-muted">{formatAddress(creator.wallet, 6, 6)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[320px] md:grid-cols-3">
                <span className="text-muted">Role: <span className="text-white">{creator.isCreator ? "Creator" : "Collaborator"}</span></span>
                <span className="text-muted">Share: <span className="font-mono text-white">{creator.royaltyPct}%</span></span>
                <span className="text-muted">Claimed: <span className="font-mono text-white">{formatSOL(creator.totalClaimedSOL ?? 0)}</span></span>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/8">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(creator.royaltyPct, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
