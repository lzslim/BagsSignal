import type { ClaimEvent } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

export function ClaimTimeline({ events }: { events: ClaimEvent[] }) {
  return (
    <Panel>
      <div className="mb-4">
        <div className="font-display text-lg font-semibold tracking-[0.01em]">Claim history</div>
        <div className="text-sm text-muted">Confirmed claim activity for this token.</div>
      </div>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={`${event.txHash}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3 w-3 rounded-full bg-brand" />
              {index < events.length - 1 ? <span className="mt-2 h-full w-px bg-line" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-white">Claimed {formatSOL(event.amountSOL)}</div>
                  <div className="text-sm text-muted">{new Date(event.timestamp).toLocaleString("en-US")}</div>
                </div>
                <a href={event.solscanUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand transition hover:brightness-110">
                  {formatAddress(event.txHash, 6, 6)}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
