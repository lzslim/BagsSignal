import type { ClaimEvent, ClaimHistoryResponse, DashboardResponse, LeaderboardEntry, LeaderboardResponse, TokenAIRecommendation, TokenPosition } from "@/lib/types";
import { mockLeaderboard } from "@/lib/mock";
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

export async function readSampleDashboardFromLeaderboard(limit = 8): Promise<DashboardResponse | null> {
  const leaderboard = await readLeaderboardFromStore({
    sort: "score",
    page: 1,
    pageSize: Math.min(Math.max(limit, 1), 20),
    search: ""
  });

  if (leaderboard.entries.length === 0) return null;

  const tokens: TokenPosition[] = leaderboard.entries.map((entry) => ({
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

export async function readSampleClaimHistoryFromLeaderboard(page = 1, pageSize = 20): Promise<ClaimHistoryResponse | null> {
  const leaderboard = await readLeaderboardFromStore({
    sort: "score",
    page: 1,
    pageSize: 50,
    search: ""
  });

  const events = leaderboard.entries
    .filter((entry) => entry.lifetimeEarnedSOL > 0 || entry.claimableSOL > 0 || entry.lifetimeTotalSOL > 0)
    .flatMap((entry, index): ClaimEvent[] => {
      const primaryAmount = entry.claimableSOL > 0
        ? entry.claimableSOL
        : Math.max(entry.lifetimeEarnedSOL * 0.08, entry.lifetimeTotalSOL * 0.004, 0.01);
      const secondaryAmount = entry.lifetimeEarnedSOL > primaryAmount
        ? Math.max(entry.lifetimeEarnedSOL * 0.035, 0.01)
        : 0;
      const baseTime = Date.now() - index * 18 * 60 * 60 * 1000;
      const wallet = entry.creatorWallet || "SampleBagsCreatorWallet111111111111111111111";

      const event: ClaimEvent = {
        mint: entry.mint,
        wallet,
        amountSOL: Number(primaryAmount.toFixed(4)),
        timestamp: new Date(baseTime).toISOString(),
        txHash: buildSampleTxHash(entry.mint, index, 0),
        solscanUrl: `https://bags.fm/${entry.mint}`
      };

      if (secondaryAmount <= 0) return [event];

      return [
        event,
        {
          mint: entry.mint,
          wallet,
          amountSOL: Number(secondaryAmount.toFixed(4)),
          timestamp: new Date(baseTime - 3 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: buildSampleTxHash(entry.mint, index, 1),
          solscanUrl: `https://bags.fm/${entry.mint}`
        }
      ];
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) return null;

  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const safePage = Math.max(page, 1);
  const total = events.length;
  const start = (safePage - 1) * safePageSize;

  return {
    demoMode: true,
    source: leaderboard.demoMode ? "demo" : "leaderboard-cache",
    events: events.slice(start, start + safePageSize),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePageSize))
    }
  };
}

function buildSampleTxHash(mint: string, index: number, sequence: number) {
  const seed = `${mint.replace(/[^a-zA-Z0-9]/g, "")}${index.toString(36)}${sequence.toString(36)}SampleClaim`;
  return `${seed}${"111111111111111111111111111111111111111111111111"}`.slice(0, 48);
}

function buildSampleChart(totalClaimableSOL: number) {
  const labels = ["Apr 30", "May 01", "May 02", "May 03", "May 04", "May 05", "May 06"];
  return labels.map((date, index) => ({
    date,
    amount: Number((totalClaimableSOL * (0.28 + index * 0.12)).toFixed(3))
  }));
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
