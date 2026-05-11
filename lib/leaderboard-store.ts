import type { ClaimEvent, ClaimHistoryResponse, DashboardResponse, LeaderboardEntry, LeaderboardResponse, SimulatedWallet, TokenAIRecommendation, TokenPosition } from "@/lib/types";
import { mockLeaderboard } from "@/lib/mock";
import { getClaimEvents } from "@/lib/bags-api";
import { hasLeaderboardSyncConfig } from "@/lib/leaderboard-sync";
import { hasSupabaseConfig, supabaseCount, supabaseSelect } from "@/lib/supabase-rest";

type DbEntry = {
  mint: string;
  symbol: string;
  name: string | null;
  image_url: string | null;
  creator_wallet: string;
  creator_wallet_short: string;
  creator_username: string | null;
  creator_provider: string | null;
  creator_url: string | null;
  creator_pfp: string | null;
  lifetime_total_sol: number;
  lifetime_earned_sol: number;
  claimable_sol: number;
  royalty_bps: number;
  royalty_pct: number;
  is_graduated: number;
  volume_1h_usd: number;
  volume_6h_usd: number;
  volume_24h_usd: number;
  volume_7d_usd: number;
  trade_count_1h: number;
  trade_count_6h: number;
  trade_count_24h: number;
  trade_count_7d: number;
  rank_score: number;
  momentum_score: number;
  ai_readiness_score: number;
  synced_at: string;
  recommendation_type: TokenAIRecommendation["recommendationType"] | null;
  stance: TokenAIRecommendation["stance"] | null;
  confidence: TokenAIRecommendation["confidence"] | null;
  recommendation_title: string | null;
  recommendation_insight: string | null;
  recommendation_action: string | null;
  evidence_json: string | null;
  recommendation_generated_at: string | null;
};

export async function readLeaderboardFromStore({
  sort = "score",
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
  const [entriesRows, recommendationRows] = await Promise.all([
    supabaseSelect<Omit<DbEntry, "recommendation_type" | "stance" | "confidence" | "recommendation_title" | "recommendation_insight" | "recommendation_action" | "evidence_json" | "recommendation_generated_at">>(
      "leaderboard_entries",
      "select=*&order=rank_score.desc"
    ),
    supabaseSelect<{
      mint: string;
      recommendation_type: TokenAIRecommendation["recommendationType"];
      stance: TokenAIRecommendation["stance"];
      confidence: TokenAIRecommendation["confidence"];
      title: string;
      insight: string;
      action: string;
      evidence_json: string;
      generated_at: string;
    }>("token_ai_recommendations", "select=*")
  ]);

  const recommendationMap = new Map(recommendationRows.map((row) => [row.mint, row]));
  const rows = entriesRows.map((row) => {
    const recommendation = recommendationMap.get(row.mint);
    return {
      ...row,
      recommendation_type: recommendation?.recommendation_type ?? null,
      stance: recommendation?.stance ?? null,
      confidence: recommendation?.confidence ?? null,
      recommendation_title: recommendation?.title ?? null,
      recommendation_insight: recommendation?.insight ?? null,
      recommendation_action: recommendation?.action ?? null,
      evidence_json: recommendation?.evidence_json ?? null,
      recommendation_generated_at: recommendation?.generated_at ?? null
    };
  }) as DbEntry[];

  if (rows.length === 0) {
    if (hasLeaderboardSyncConfig()) {
      return filterAndPaginate(
        {
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
        },
        sort,
        page,
        pageSize,
        search,
        wallet
      );
    }
    return filterAndPaginate(mockLeaderboard, sort, page, pageSize, search, wallet);
  }

  const entries: LeaderboardEntry[] = rows.map((row, index) => ({
    rank: index + 1,
    mint: row.mint,
    symbol: row.symbol,
    name: row.name,
    imageUrl: row.image_url,
    creatorWallet: row.creator_wallet,
    creatorWalletShort: row.creator_wallet_short,
    creatorUsername: row.creator_username,
    creatorProvider: row.creator_provider,
    creatorUrl: row.creator_url,
    creatorPfp: row.creator_pfp,
    lifetimeTotalSOL: Number(row.lifetime_total_sol),
    lifetimeEarnedSOL: Number(row.lifetime_earned_sol),
    claimableSOL: Number(row.claimable_sol),
    royaltyBps: Number(row.royalty_bps),
    royaltyPct: Number(row.royalty_pct),
    isGraduated: Boolean(row.is_graduated),
    volume1hUsd: Number(row.volume_1h_usd),
    volume6hUsd: Number(row.volume_6h_usd),
    volume24hUsd: Number(row.volume_24h_usd),
    volume7dUsd: Number(row.volume_7d_usd),
    tradeCount1h: Number(row.trade_count_1h),
    tradeCount6h: Number(row.trade_count_6h),
    tradeCount24h: Number(row.trade_count_24h),
    tradeCount7d: Number(row.trade_count_7d),
    rankScore: Number(row.rank_score),
    momentumScore: Number(row.momentum_score),
    aiReadinessScore: Number(row.ai_readiness_score),
    aiRecommendation: buildRecommendation(row),
    isMe: wallet ? row.creator_wallet === wallet : false
  })) as LeaderboardEntry[];

  return filterAndPaginate(
    {
      demoMode: false,
      stats: {
        totalCreators: entries.length,
        totalFeesSOL: entries.reduce((sum, entry) => sum + entry.lifetimeTotalSOL, 0),
        topEarnerSOL: Math.max(...entries.map((entry) => entry.lifetimeEarnedSOL), 0)
      },
      entries,
      pagination: {
        page: 1,
        pageSize: entries.length,
        total: entries.length,
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

export async function readLeaderboardSyncMeta() {
  const latest = await supabaseSelect<{
    id: number;
    status: string;
    source: string;
    message: string | null;
    tokens_seen: number;
    synced_entries: number;
    created_at: string;
  }>("leaderboard_sync_runs", "select=id,status,source,message,tokens_seen,synced_entries,created_at&order=id.desc&limit=1");

  return latest[0] ?? null;
}

export async function shouldAutoSyncLeaderboard() {
  const latest = await readLeaderboardSyncMeta();
  if (!latest || latest.status !== "failed") return true;

  const lastRunAt = new Date(latest.created_at).getTime();
  if (!Number.isFinite(lastRunAt)) return true;

  const cooldownMs = Number(process.env.LEADERBOARD_FAILED_SYNC_COOLDOWN_MS ?? "900000");
  return Date.now() - lastRunAt > cooldownMs;
}

export async function getLeaderboardEntryCount() {
  if (!hasSupabaseConfig()) return 0;
  return supabaseCount("leaderboard_entries");
}

function buildRecommendation(row: DbEntry): TokenAIRecommendation | null {
  if (!row.recommendation_type || !row.stance || !row.confidence || !row.recommendation_title || !row.recommendation_insight || !row.recommendation_action) {
    return null;
  }

  let evidence: TokenAIRecommendation["evidence"];
  try {
    evidence = JSON.parse(row.evidence_json ?? "{}") as TokenAIRecommendation["evidence"];
  } catch {
    evidence = {
      rankScore: Number(row.rank_score),
      momentumScore: Number(row.momentum_score),
      volume24hUsd: Number(row.volume_24h_usd),
      tradeCount24h: Number(row.trade_count_24h),
      lifetimeEarnedSOL: Number(row.lifetime_earned_sol),
      claimableSOL: Number(row.claimable_sol),
      aiReadinessScore: Number(row.ai_readiness_score)
    };
  }

  return {
    recommendationType: row.recommendation_type,
    stance: row.stance,
    confidence: row.confidence,
    title: row.recommendation_title,
    insight: row.recommendation_insight,
    action: row.recommendation_action,
    evidence,
    generatedAt: row.recommendation_generated_at ?? undefined
  };
}

export async function readSimulationWalletsFromLeaderboard(limit = 8): Promise<SimulatedWallet[]> {
  const leaderboard = await readLeaderboardFromStore({
    sort: "score",
    page: 1,
    pageSize: 50,
    search: ""
  });

  const walletMap = new Map<string, SimulatedWallet & { score: number }>();

  for (const entry of leaderboard.entries) {
    if (!entry.creatorWallet) continue;

    const current = walletMap.get(entry.creatorWallet);
    const label = entry.creatorUsername
      ? `@${entry.creatorUsername}`
      : entry.creatorWalletShort || `${entry.creatorWallet.slice(0, 6)}...${entry.creatorWallet.slice(-4)}`;
    const score = (entry.rankScore ?? 0) + entry.lifetimeEarnedSOL * 4 + entry.claimableSOL * 8;

    if (!current) {
      walletMap.set(entry.creatorWallet, {
        wallet: entry.creatorWallet,
        walletShort: entry.creatorWalletShort || `${entry.creatorWallet.slice(0, 6)}...${entry.creatorWallet.slice(-4)}`,
        label,
        provider: entry.creatorProvider,
        tokenCount: 1,
        lifetimeEarnedSOL: entry.lifetimeEarnedSOL,
        claimableSOL: entry.claimableSOL,
        topTokenSymbol: entry.symbol,
        score
      });
      continue;
    }

    current.tokenCount += 1;
    current.lifetimeEarnedSOL += entry.lifetimeEarnedSOL;
    current.claimableSOL += entry.claimableSOL;
    current.score += score;
    if ((entry.rankScore ?? 0) > current.score) current.topTokenSymbol = entry.symbol;
  }

  return Array.from(walletMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 12))
    .map(({ score: _score, ...wallet }) => ({
      ...wallet,
      lifetimeEarnedSOL: Number(wallet.lifetimeEarnedSOL.toFixed(4)),
      claimableSOL: Number(wallet.claimableSOL.toFixed(4))
    }));
}

export async function readSampleDashboardFromLeaderboard(limit = 8, simulatedWallet?: string | null): Promise<DashboardResponse | null> {
  const leaderboard = await readLeaderboardFromStore({
    sort: "score",
    page: 1,
    pageSize: simulatedWallet ? 50 : Math.min(Math.max(limit, 1), 20),
    search: ""
  });

  const entries = simulatedWallet
    ? leaderboard.entries.filter((entry) => entry.creatorWallet === simulatedWallet)
    : leaderboard.entries;

  if (entries.length === 0) return null;

  const tokens: TokenPosition[] = entries.slice(0, limit).map((entry) => ({
    mint: entry.mint,
    symbol: entry.symbol,
    name: entry.name ?? entry.symbol,
    pfp: entry.imageUrl ?? null,
    claimableSOL: entry.claimableSOL,
    lifetimeTotalSOL: entry.lifetimeTotalSOL,
    lifetimeEarnedSOL: entry.lifetimeEarnedSOL,
    royaltyBps: entry.royaltyBps,
    royaltyPct: entry.royaltyPct,
    isCustomFeeVault: entry.royaltyBps !== 0 && entry.royaltyBps !== 10000,
    isMigrated: entry.isGraduated,
    collaborators: entry.creatorProvider && entry.creatorProvider !== "unknown" ? 1 : 0,
    feeMode: entry.royaltyBps !== 0 && entry.royaltyBps !== 10000 ? "Custom" : "Default"
  }));

  const totalClaimableSOL = tokens.reduce((sum, token) => sum + token.claimableSOL, 0);
  const totalLifetimeEarnedSOL = tokens.reduce((sum, token) => sum + token.lifetimeEarnedSOL, 0);
  const totalLifetimeFeesSOL = tokens.reduce((sum, token) => sum + token.lifetimeTotalSOL, 0);

  return {
    demoMode: true,
    simulatedWallet: simulatedWallet ?? null,
    summary: {
      totalClaimableSOL,
      totalLifetimeEarnedSOL,
      totalLifetimeFeesSOL,
      tokenCount: tokens.length,
      collaboratorCount: tokens.reduce((sum, token) => sum + token.collaborators, 0)
    },
    tokens,
    chart: buildSampleChart(totalClaimableSOL)
  };
}

export async function readSampleClaimHistoryFromLeaderboard(page = 1, pageSize = 20, simulatedWallet?: string | null): Promise<ClaimHistoryResponse | null> {
  const leaderboard = await readLeaderboardFromStore({
    sort: "score",
    page: 1,
    pageSize: 50,
    search: ""
  });

  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const safePage = Math.max(page, 1);
  const candidateWallets = simulatedWallet
    ? [simulatedWallet]
    : shuffle(Array.from(new Set(leaderboard.entries.map((entry) => entry.creatorWallet).filter(Boolean))));

  for (const wallet of candidateWallets) {
    const entries = leaderboard.entries.filter((entry) => entry.creatorWallet === wallet);
    const realEvents = (await Promise.all(
      entries.map((entry) => getClaimEvents(entry.mint, wallet, 100, 0).catch(() => []))
    )).flat();

    const sortedRealEvents = realEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const start = (safePage - 1) * safePageSize;

    if (sortedRealEvents.length === 0 && !simulatedWallet) continue;

    return {
      demoMode: true,
      source: "bags-api",
      simulatedWallet: wallet,
      events: sortedRealEvents.slice(start, start + safePageSize),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total: sortedRealEvents.length,
        totalPages: Math.max(1, Math.ceil(sortedRealEvents.length / safePageSize))
      }
    };
  }

  return {
    demoMode: true,
    source: "bags-api",
    simulatedWallet: simulatedWallet ?? null,
    events: [],
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      totalPages: 1
    }
  };
}

function buildSampleChart(totalClaimableSOL: number) {
  const labels = ["Apr 30", "May 01", "May 02", "May 03", "May 04", "May 05", "May 06"];
  return labels.map((date, index) => ({
    date,
    amount: Number((totalClaimableSOL * (0.28 + index * 0.12)).toFixed(3))
  }));
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
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
    if (sort === "score") return (b.rankScore ?? 0) - (a.rankScore ?? 0);
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
      topEarnerSOL: Math.max(...entries.map((entry) => entry.lifetimeEarnedSOL), 0)
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
