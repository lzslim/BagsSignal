import { Copy, ExternalLink, GraduationCap, Waves } from "lucide-react";
import type { TokenPosition } from "@/lib/types";
import { formatAddress, formatSOL } from "@/lib/utils";
import { Panel } from "@/components/shared/Panel";

export function TokenList({
  tokens,
  onClaim
}: {
  tokens: TokenPosition[];
  onClaim: (mint: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-semibold tracking-[0.01em]">Creator tokens</div>
          <div className="text-sm text-muted">Sorted by claimable balance</div>
        </div>
      </div>
      {tokens.map((token) => {
        const bagsUrl = `https://bags.fm/${token.mint}`;
        return (
          <Panel key={token.mint} className="transition hover:border-brand/40 hover:bg-panelHover">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-brand/30 bg-brand/10 font-semibold text-brand">
                  {token.pfp ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={token.pfp} alt={token.symbol} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    token.symbol.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0">
                  <a href={bagsUrl} target="_blank" rel="noreferrer" className="font-display text-lg font-semibold tracking-[0.01em] text-white transition hover:text-brand">
                    {token.symbol}
                  </a>
                  <div className="text-sm text-muted">{token.name}</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted">
                    <span>{formatAddress(token.mint, 6, 6)}</span>
                    <Copy className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div className="flex-1 xl:max-w-xl">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">Claimable</span>
                  <span className="font-mono font-semibold text-brand">{formatSOL(token.claimableSOL)}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-2">
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                    <span>Lifetime earned:</span>
                    <span className="whitespace-nowrap font-mono text-white">{formatSOL(token.lifetimeEarnedSOL)}</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    {token.isMigrated ? <GraduationCap className="mr-1 inline h-3 w-3 text-brand" /> : <Waves className="mr-1 inline h-3 w-3 text-warning" />}
                    {token.isMigrated ? "Graduated" : "Bonding curve"}
                  </span>
                  {token.collaborators > 0 ? (
                    <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                      {token.collaborators} fee partners
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onClaim(token.mint)}
                  className="h-11 rounded-lg border border-brand/40 px-4 text-sm font-semibold text-brand transition hover:bg-brand hover:text-black"
                >
                  Claim
                </button>
                <a
                  href={bagsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${token.symbol} on Bags`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-muted transition hover:border-brand/40 hover:text-white"
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
