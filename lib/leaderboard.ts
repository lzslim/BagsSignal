import { getClaimablePositions, getTokenCreators, getTokenLifetimeFees } from "@/lib/bags-api";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/types";
import { formatAddress, tokenLabel } from "@/lib/utils";

export async function getLeaderboard({
  sort = "lifetime",
  page = 1,
  pageSize = 20,
  search = "",
  wallet
}: {
  sort?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  wallet?: string | null;
}): Promise<LeaderboardResponse> {
  const seedMints = parseSeedMints();
  if (!process.env.BAGS_API_KEY || seedMints.length === 0) {
    return filterAndPaginate(emptyLeaderboard(), sort, page, pageSize, search, wallet);
  }

  const walletPositions = wallet ? await getClaimablePositions(wallet).catch(() => []) : [];
  const settled = await Promise.allSettled(
    seedMints.map(async (mint, index) => {
      const [lifetimeTotalSOL, creators] = await Promise.all([
        getTokenLifetimeFees(mint).catch(() => 0),
        getTokenCreators(mint, wallet ?? undefined).catch(() => [])
      ]);

      const primaryCreator = creators.find((creator) => creator.isCreator) ?? creators[0];
      if (!primaryCreator) return null;

      const labels = tokenLabel(mint, index);
      const walletPosition = walletPositions.find((position) => position.baseMint === mint);
      const claimableSOL = walletPosition ? Number(walletPosition.totalClaimableLamportsUserShare ?? 0) / 1_000_000_000 : 0;

      return {
        rank: 0,
        mint,
        symbol: labels.symbol,
        creatorWallet: primaryCreator.wallet,
        creatorWalletShort: formatAddress(primaryCreator.wallet, 4, 4),
        creatorUsername: primaryCreator.providerUsername ?? primaryCreator.username ?? null,
        creatorProvider: primaryCreator.provider,
        creatorPfp: primaryCreator.pfp ?? null,
        lifetimeTotalSOL,
        lifetimeEarnedSOL: lifetimeTotalSOL * ((primaryCreator.royaltyBps ?? 0) / 10000),
        claimableSOL,
        royaltyBps: primaryCreator.royaltyBps,
        royaltyPct: primaryCreator.royaltyPct,
        isGraduated: true,
        isMe: wallet ? primaryCreator.wallet === wallet : false
      } satisfies LeaderboardEntry;
    })
  );

  const entriesRaw = settled
    .flatMap((result) => (result.status === "fulfilled" && result.value ? [result.value] : []))
    .map((entry) => ({ ...entry })) as LeaderboardEntry[];

  const stats = {
    totalCreators: entriesRaw.length,
    totalFeesSOL: entriesRaw.reduce((sum, entry) => sum + entry.lifetimeTotalSOL, 0),
    topEarnerSOL: [...entriesRaw].sort((a, b) => b.lifetimeEarnedSOL - a.lifetimeEarnedSOL)[0]?.lifetimeEarnedSOL ?? 0
  };

  return filterAndPaginate(
    {
      demoMode: false,
      stats,
      entries: entriesRaw,
      pagination: {
        page: 1,
        pageSize: entriesRaw.length,
        total: entriesRaw.length,
        totalPages: 1
      }
    },
    sort,
    page,
    pageSize,
    search,
    wallet
  );
}

function emptyLeaderboard(): LeaderboardResponse {
  return {
    demoMode: false,
    stats: {
      totalCreators: 0,
      totalFeesSOL: 0,
      topEarnerSOL: 0
    },
    entries: [],
    pagination: {
      page: 1,
      pageSize: 0,
      total: 0,
      totalPages: 1
    }
  };
}

function parseSeedMints() {
  return (process.env.LEADERBOARD_SEED_MINTS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function filterAndPaginate(
  data: LeaderboardResponse,
  sort: string,
  page: number,
  pageSize: number,
  search: string,
  wallet?: string | null
): LeaderboardResponse {
  const query = search.trim().toLowerCase();
  let entries = data.entries.map((entry) => ({
    ...entry,
    isMe: wallet ? entry.creatorWallet === wallet : entry.isMe
  }));

  if (query) {
    entries = entries.filter((entry) =>
      entry.symbol.toLowerCase().includes(query) ||
      entry.creatorWallet.toLowerCase().includes(query) ||
      (entry.creatorUsername ?? "").toLowerCase().includes(query)
    );
  }

  entries = entries.sort((a, b) => {
    if (sort === "claimable") return b.claimableSOL - a.claimableSOL;
    if (sort === "token") return a.symbol.localeCompare(b.symbol);
    return b.lifetimeEarnedSOL - a.lifetimeEarnedSOL;
  });

  entries = entries.map((entry, index) => ({ ...entry, rank: index + 1 }));

  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const safePage = Math.max(page, 1);
  const total = entries.length;
  const start = (safePage - 1) * safePageSize;

  return {
    demoMode: data.demoMode ?? false,
    stats: {
      totalCreators: total,
      totalFeesSOL: entries.reduce((sum, entry) => sum + entry.lifetimeTotalSOL, 0),
      topEarnerSOL: entries[0]?.lifetimeEarnedSOL ?? 0
    },
    entries: entries.slice(start, start + safePageSize),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePageSize))
    }
  };
}
