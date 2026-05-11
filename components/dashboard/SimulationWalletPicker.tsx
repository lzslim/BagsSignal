"use client";

import { UserRoundSearch } from "lucide-react";
import useSWR from "swr";
import type { SimulatedWallet } from "@/lib/types";
import { formatSOL } from "@/lib/utils";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Failed to load simulation wallets");
  return json as { wallets: SimulatedWallet[] };
};

export function SimulationWalletPicker({
  onSelect,
  compact = false
}: {
  onSelect: (wallet: string) => void;
  compact?: boolean;
}) {
  const { data, error, isLoading } = useSWR("/api/simulation/wallets", fetcher);
  const wallets = data?.wallets ?? [];

  return (
    <div className="mt-8 w-full border border-white/10 bg-black/20 p-4 text-left">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <UserRoundSearch className="h-4 w-4 text-brand" />
            Simulate a ranked creator wallet
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">
            Pick a creator wallet from leaderboard data to preview its dashboard and claim history.
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {isLoading ? "loading" : `${wallets.length} wallets`}
        </div>
      </div>

      {error ? <div className="mt-4 text-sm text-danger">{error.message}</div> : null}

      <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {wallets.map((wallet) => (
          <button
            key={wallet.wallet}
            type="button"
            onClick={() => onSelect(wallet.wallet)}
            className="group border border-white/10 bg-[#0b0d10] p-4 text-left transition hover:border-brand/40 hover:bg-brand/[0.045]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">{wallet.label}</div>
                <div className="mt-1 font-mono text-xs text-muted">{wallet.walletShort}</div>
              </div>
              <div className="border border-brand/20 bg-brand/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
                {wallet.topTokenSymbol}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted">Earned</div>
                <div className="mt-1 whitespace-nowrap font-mono text-white">{formatSOL(wallet.lifetimeEarnedSOL)}</div>
              </div>
              <div>
                <div className="text-muted">Claimable</div>
                <div className="mt-1 whitespace-nowrap font-mono text-brand">{formatSOL(wallet.claimableSOL)}</div>
              </div>
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {wallet.tokenCount} token{wallet.tokenCount === 1 ? "" : "s"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
