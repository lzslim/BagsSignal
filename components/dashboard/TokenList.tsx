import { Copy, ExternalLink, GraduationCap, Waves } from "lucide-react";
import type { TokenPosition } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

export function TokenList({
  tokens,
  onClaim,
  claimBlocked = false
}: {
  tokens: TokenPosition[];
  onClaim: (mint: string) => void;
  claimBlocked?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-xl font-semibold tracking-[0.01em] text-white">Creator tokens</div>
          <div className="mt-1 text-sm text-muted">Positions ranked by claimable balance and revenue context</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted">
          {tokens.length} active
        </div>
      </div>
      {tokens.map((token) => {
        const bagsUrl = `https://bags.fm/${token.mint}`;
        return (
          <Panel key={token.mint} className="group overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-panelHover">
            <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(260px,1fr)_minmax(230px,0.8fr)_auto] xl:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand/25 bg-brand/10 font-semibold text-brand shadow-[0_0_24px_rgba(2,255,64,0.08)]">
                  {token.pfp ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={token.pfp} alt={token.symbol} className="h-full w-full object-cover" />
                  ) : (
                    token.symbol.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0">
                  <a href={bagsUrl} target="_blank" rel="noreferrer" className="font-display text-lg font-semibold tracking-[0.01em] text-white transition hover:text-brand">
                    {token.symbol}
                  </a>
                  <div className="mt-1 truncate text-sm text-muted">{token.name}</div>
                  <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted">
                    <span>{formatAddress(token.mint, 6, 6)}</span>
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted">Claimable</span>
                  <span className="whitespace-nowrap font-mono text-base font-semibold text-brand">{formatSOL(token.claimableSOL)}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-muted">
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                    <span>Lifetime earned:</span>
                    <span className="whitespace-nowrap font-mono text-white">{formatSOL(token.lifetimeEarnedSOL)}</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted">
                    {token.isMigrated ? <GraduationCap className="mr-1 inline h-3 w-3 text-brand" /> : <Waves className="mr-1 inline h-3 w-3 text-warning" />}
                    {token.isMigrated ? "Graduated" : "Bonding curve"}
                  </span>
                  {token.collaborators > 0 ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted">
                      {token.collaborators} fee partners
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3 xl:justify-end">
                <button
                  type="button"
                  onClick={() => onClaim(token.mint)}
                  title={claimBlocked ? "Claim requires the owner wallet for the currently viewed creator data." : "Claim Bags creator fees"}
                  className={
                    claimBlocked
                      ? "h-11 rounded-lg border border-warning/35 bg-warning/10 px-4 text-sm font-semibold text-orange-100 transition hover:border-warning/60 hover:bg-warning/20"
                      : "h-11 rounded-lg border border-brand/40 bg-brand/10 px-4 text-sm font-semibold text-brand transition hover:bg-brand hover:text-black"
                  }
                >
                  Claim
                </button>
                <a
                  href={bagsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${token.symbol} on Bags`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
                >
                  Bags
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
