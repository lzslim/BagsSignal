"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { AIMarketRead } from "@/components/leaderboard/AIMarketRead";
import { ErrorState, LoadingState } from "@/components/shared/StateViews";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { formatSOL } from "@/lib/utils";

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const wallet = publicKey?.toBase58() ?? null;
  const { data, error, isLoading } = useLeaderboard({
    sort: "score",
    period: "all",
    page,
    pageSize: 20,
    search,
    wallet
  });
  const { data: topData } = useLeaderboard({
    sort: "score",
    period: "all",
    page: 1,
    pageSize: 3,
    search: "",
    wallet
  });

  return (
    <AppShell title="Creator leaderboard">
      <div className="mx-auto max-w-7xl pb-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-[0.01em]">Creator Leaderboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              See active Bags token creators ranked by fee revenue, recent trading, momentum, and AI-ready market signals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`rounded-full px-3 py-2 text-xs font-medium ${
                data?.demoMode
                  ? "border border-warning/30 bg-warning/10 text-warning"
                  : "border border-brand/20 bg-brand/10 text-brand"
              }`}
            >
              {data?.demoMode ? "Demo Data" : "Live Data"}
            </div>
          </div>
        </div>

        {data ? (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-panel p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Total Creators Ranked</div>
              <div className="mt-3 font-mono text-3xl font-bold text-brand">{data.stats.totalCreators}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Total Fees Generated</div>
              <div className="mt-3 font-mono text-3xl font-bold text-white">{formatSOL(data.stats.totalFeesSOL)}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Highest Single Earner</div>
              <div className="mt-3 font-mono text-3xl font-bold text-cyan">{formatSOL(data.stats.topEarnerSOL)}</div>
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <LeaderboardFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        <div className="mb-6 overflow-hidden rounded-lg border border-line bg-panel/85">
          <div className="border-b border-line px-5 py-4">
            <div className="font-display text-base font-semibold tracking-[0.01em] text-white">Tracking logic</div>
            <div className="mt-1 text-sm text-muted">
              This leaderboard tracks an active Bags token universe instead of claiming full historical coverage.
            </div>
          </div>
          <div className="grid gap-4 px-5 py-4 lg:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Universe</div>
              <div className="mt-2 text-sm leading-6 text-white">
                We merge recent Bags launches with actively traded Bags mints and refresh the ranked token set on a recurring data update cycle.
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Rank Formula</div>
              <div className="mt-2 text-sm leading-6 text-white">
                <span className="font-mono text-brand">Score</span>
                {" = 40% creator earnings + 25% 24h volume + 15% claimable fees + 10% trade activity + 10% momentum"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">AI Features</div>
              <div className="mt-2 text-sm leading-6 text-white">
                The sync stores 1h/6h/24h/7d volume, trade velocity, growth ratios, metadata quality, social creator signals, and risk flags.
              </div>
            </div>
          </div>
        </div>

        {isLoading ? <LoadingState label="Loading leaderboard..." /> : null}
        {error ? <ErrorState message={error.message} /> : null}

            {data ? (
          <div className="space-y-6">
            <LeaderboardPodium entries={topData?.entries ?? data.entries.slice(0, 3)} demoMode={data.demoMode} />
            <AIMarketRead entries={data.entries} />
            <LeaderboardTable
              entries={data.entries}
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              demoMode={data.demoMode}
              showingLabel={`Showing ${(data.pagination.page - 1) * data.pagination.pageSize + 1}-${Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of ${data.pagination.total} creators`}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
