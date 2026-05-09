import { ExternalLink, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";
import {
  creatorProviderIconPath,
  creatorProviderLabel,
  formatAddress,
  formatSOL,
  isKnownCreatorProvider,
  tokenFallbackDataUrl
} from "@/lib/utils";

const accents = [
  { border: "border-[#FFD700]", text: "text-[#FFD700]", offset: "mt-0" },
  { border: "border-[#C0C0C0]", text: "text-[#C0C0C0]", offset: "mt-8" },
  { border: "border-[#CD7F32]", text: "text-[#CD7F32]", offset: "mt-8" }
];

export function LeaderboardPodium({
  entries,
  demoMode
}: {
  entries: LeaderboardEntry[];
  demoMode?: boolean;
}) {
  const top = entries.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {top.map((entry, index) => {
        const accent = accents[index];
        const hasKnownCreator = isKnownCreatorProvider(entry.creatorProvider) && Boolean(entry.creatorUsername);
        const creatorHandle = entry.creatorUsername?.replace(/^@/, "");
        const providerIcon = creatorProviderIconPath(entry.creatorProvider);
        const providerLabel = creatorProviderLabel(entry.creatorProvider);
        const tokenImage = entry.imageUrl || tokenFallbackDataUrl(entry.mint, entry.symbol);
        return (
          <div
            key={entry.mint}
            className={`${accent.offset} rounded-lg border-2 ${accent.border} bg-panel p-6 shadow-[0_0_30px_rgba(255,255,255,0.04)]`}
          >
            <div className={`mb-4 flex items-center gap-2 text-sm font-semibold ${accent.text}`}>
              <Trophy className="h-4 w-4" />
              #{entry.rank}
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-white/5 text-xl font-semibold text-white">
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tokenImage} alt={entry.symbol} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tokenImage} alt={entry.symbol} className="h-16 w-16 rounded-full object-cover" />
              )}
            </div>
            <div className="mt-4 text-lg font-semibold text-white">
              ${entry.symbol}
              {(entry.momentumScore ?? 0) >= 0.65 ? <span className="ml-2">🔥</span> : null}
            </div>
            {entry.name ? <div className="mt-1 text-xs text-muted">{entry.name}</div> : null}
            <div className="mt-2 font-mono text-xs text-muted">CA: {formatAddress(entry.mint, 6, 6)}</div>
            <div className="mt-4 text-sm font-medium text-white">
              {hasKnownCreator && creatorHandle && entry.creatorUrl ? (
                <a href={entry.creatorUrl} target="_blank" rel="noreferrer" className="hover:text-brand">
                  @{creatorHandle}
                </a>
              ) : hasKnownCreator && creatorHandle ? (
                `@${creatorHandle}`
              ) : (
                entry.creatorWalletShort
              )}
            </div>
            {hasKnownCreator && providerIcon ? (
              <div className="mt-1.5 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={providerIcon}
                  alt={providerLabel ?? "Creator platform"}
                  title={providerLabel ?? "Creator platform"}
                  className="h-4 w-4 opacity-80 transition hover:opacity-100"
                />
              </div>
            ) : null}
            <div className="mt-6 text-xs uppercase tracking-[0.18em] text-muted">Lifetime earned</div>
            <div className="mt-2 font-mono text-3xl font-bold text-white">{formatSOL(entry.lifetimeEarnedSOL)}</div>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <div>Claimable now: <span className="font-mono text-brand">{formatSOL(entry.claimableSOL)}</span></div>
              <div>Share: {entry.royaltyPct}%</div>
            </div>
            {!demoMode ? (
              <a
                href={`https://bags.fm/${entry.mint}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-white transition hover:border-brand/40 hover:bg-brand/10"
              >
                View on Bags
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
