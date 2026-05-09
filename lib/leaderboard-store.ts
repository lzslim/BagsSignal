import type { DashboardResponse, LeaderboardEntry, LeaderboardResponse, TokenAIRecommendation, TokenPosition } from "@/lib/types";
import { getDb } from "@/lib/sqlite";
import { mockLeaderboard } from "@/lib/mock";
import { hasLeaderboardSyncConfig } from "@/lib/leaderboard-sync";

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

export function readLeaderboardFromStore({
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
}): LeaderboardResponse {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      leaderboard_entries.mint,
      leaderboard_entries.symbol,
      leaderboard_entries.name,
      leaderboard_entries.image_url,
      leaderboard_entries.creator_wallet,
      leaderboard_entries.creator_wallet_short,
      leaderboard_entries.creator_username,
      leaderboard_entries.creator_provider,
      leaderboard_entries.creator_url,
      leaderboard_entries.creator_pfp,
      leaderboard_entries.lifetime_total_sol,
      leaderboard_entries.lifetime_earned_sol,
      leaderboard_entries.claimable_sol,
      leaderboard_entries.royalty_bps,
      leaderboard_entries.royalty_pct,
      leaderboard_entries.is_graduated,
      leaderboard_entries.volume_1h_usd,
      leaderboard_entries.volume_6h_usd,
      leaderboard_entries.volume_24h_usd,
      leaderboard_entries.volume_7d_usd,
      leaderboard_entries.trade_count_1h,
      leaderboard_entries.trade_count_6h,
      leaderboard_entries.trade_count_24h,
      leaderboard_entries.trade_count_7d,
      leaderboard_entries.rank_score,
      leaderboard_entries.momentum_score,
      leaderboard_entries.ai_readiness_score,
      leaderboard_entries.synced_at,
      rec.recommendation_type,
      rec.stance,
      rec.confidence,
      rec.title as recommendation_title,
      rec.insight as recommendation_insight,
      rec.action as recommendation_action,
      rec.evidence_json,
      rec.generated_at as recommendation_generated_at
    FROM leaderboard_entries
    LEFT JOIN token_ai_recommendations rec ON rec.mint = leaderboard_entries.mint
  `).all() as DbEntry[];

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

export function readLeaderboardSyncMeta() {
  const db = getDb();
  const latest = db.prepare(`
    SELECT id, status, source, message, tokens_seen, synced_entries, created_at
    FROM leaderboard_sync_runs
    ORDER BY id DESC
    LIMIT 1
  `).get() as
    | {
    id: number;
    status: string;
    source: string;
    message: string | null;
    tokens_seen: number;
    synced_entries: number;
    created_at: string;
  }
    | undefined;

  return latest ?? null;
}

export function shouldAutoSyncLeaderboard() {
  const latest = readLeaderboardSyncMeta();
  if (!latest || latest.status !== "failed") return true;

  const lastRunAt = new Date(latest.created_at).getTime();
  if (!Number.isFinite(lastRunAt)) return true;

  const cooldownMs = Number(process.env.LEADERBOARD_FAILED_SYNC_COOLDOWN_MS ?? "900000");
  return Date.now() - lastRunAt > cooldownMs;
}

export function getLeaderboardEntryCount() {
  const db = getDb();
  const row = db.prepare("SELECT count(*) as total FROM leaderboard_entries").get() as { total: number };
  return Number(row.total);
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

export function readSampleDashboardFromLeaderboard(limit = 8): DashboardResponse | null {
  const leaderboard = readLeaderboardFromStore({
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
