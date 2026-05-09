import { fetchBagsTokens, fetchBagsTradeMetrics } from "@/lib/bitquery";
import { getClaimablePositions, getTokenCreators, getTokenLaunchFeed, getTokenLifetimeFees, getTokenPublicProfile } from "@/lib/bags-api";
import { getDb } from "@/lib/sqlite";
import { creatorProviderUrl, formatAddress } from "@/lib/utils";

type DiscoveredLeaderboardToken = {
  mint: string;
  symbol: string;
  name: string;
  createdAt: string;
  imageUrl: string | null;
  discoverySource?: string;
  fallbackCreatorProvider?: string | null;
  fallbackCreatorUsername?: string | null;
  fallbackCreatorUrl?: string | null;
};

declare global {
  var __bagssignalLeaderboardSyncPromise: Promise<{ syncedEntries: number; tokensSeen: number }> | null | undefined;
}

export async function syncLeaderboardNow() {
  if (global.__bagssignalLeaderboardSyncPromise) {
    return global.__bagssignalLeaderboardSyncPromise;
  }

  global.__bagssignalLeaderboardSyncPromise = runSync();
  try {
    return await global.__bagssignalLeaderboardSyncPromise;
  } finally {
    global.__bagssignalLeaderboardSyncPromise = null;
  }
}

export function hasLeaderboardSyncConfig() {
  return Boolean(process.env.BITQUERY_ACCESS_TOKEN?.trim());
}

export function getLeaderboardSyncIntervalMs() {
  return Math.max(Number(process.env.LEADERBOARD_SYNC_INTERVAL_MS ?? "600000"), 60_000);
}

async function discoverLeaderboardTokens(limit: number): Promise<DiscoveredLeaderboardToken[]> {
  try {
    return (await fetchBagsTokens(limit)).map((token) => ({ ...token, imageUrl: null as string | null }));
  } catch (bitqueryError) {
    const feed = await getTokenLaunchFeed();
    if (feed.length === 0) {
      throw bitqueryError instanceof Error ? bitqueryError : new Error("No leaderboard discovery source returned tokens");
    }

    return feed.slice(0, limit).map((token) => ({
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      createdAt: token.createdAt,
      imageUrl: token.imageUrl,
      fallbackCreatorProvider: token.twitter ? "twitter" : null,
      fallbackCreatorUsername: token.twitter ? parseSocialHandle(token.twitter) : null,
      fallbackCreatorUrl: token.twitter || null,
      discoverySource: "bags-feed"
    }));
  }
}

async function runSync() {
  const db = getDb();
  const now = new Date().toISOString();

  try {
    const syncLimit = Math.max(Number(process.env.LEADERBOARD_SYNC_LIMIT ?? "100"), 100);
    const discoveryLimit = Math.max(Number(process.env.LEADERBOARD_DISCOVERY_LIMIT ?? String(syncLimit * 8)), syncLimit);
    const discovered = await discoverLeaderboardTokens(discoveryLimit);
    if (discovered.length === 0) {
      throw new Error("No Bags tokens were discovered; keeping the existing leaderboard cache.");
    }
    const feedMap = await getTokenLaunchFeed()
      .then((feed) => new Map(feed.map((token) => [token.mint, token])))
      .catch(() => new Map<string, Awaited<ReturnType<typeof getTokenLaunchFeed>>[number]>());
    const discoveredMints = discovered.map((token) => token.mint);
    const [tradeMetrics1h, tradeMetrics6h, tradeMetrics24h, tradeMetrics7d] = await Promise.all([
      fetchBagsTradeMetrics(discoveredMints, 1).catch(() => []),
      fetchBagsTradeMetrics(discoveredMints, 6).catch(() => []),
      fetchBagsTradeMetrics(discoveredMints, 24).catch(() => []),
      fetchBagsTradeMetrics(discoveredMints, 168).catch(() => [])
    ]);
    const tradeMap1h = new Map(tradeMetrics1h.map((metric) => [metric.mint, metric]));
    const tradeMap6h = new Map(tradeMetrics6h.map((metric) => [metric.mint, metric]));
    const tradeMap24h = new Map(tradeMetrics24h.map((metric) => [metric.mint, metric]));
    const tradeMap7d = new Map(tradeMetrics7d.map((metric) => [metric.mint, metric]));

    const candidates = discovered
      .map((token) => {
        const metric24h = tradeMap24h.get(token.mint);
        const metric7d = tradeMap7d.get(token.mint);
        const activeScore = buildActiveScore({
          volumeUsd24h: metric24h?.volumeUsd ?? 0,
          tradeCount24h: metric24h?.tradeCount ?? 0,
          lifetimeEarnedSOL: 0,
          claimableSOL: 0
        });

        return {
          ...token,
          preScore: activeScore + (metric7d?.volumeUsd ?? 0) * 0.08 + (metric7d?.tradeCount ?? 0) * 1.5
        };
      })
      .sort((a, b) => b.preScore - a.preScore)
      .slice(0, Math.max(syncLimit * 2, 80));

    const rows = await mapWithConcurrency(candidates, 6, async (token) => {
      const [lifetimeTotalSOL, creators, publicProfile] = await Promise.all([
        getTokenLifetimeFees(token.mint).catch(() => 0),
        getTokenCreators(token.mint).catch(() => []),
        token.imageUrl ? Promise.resolve({ imageUrl: token.imageUrl }) : getTokenPublicProfile(token.mint).catch(() => ({ imageUrl: null }))
      ]);

      const feedToken = feedMap.get(token.mint);
      const fallbackCreatorUrl = typeof token.fallbackCreatorUrl === "string" ? token.fallbackCreatorUrl : feedToken?.twitter ?? null;
      const fallbackCreatorUsername =
        typeof token.fallbackCreatorUsername === "string" ? token.fallbackCreatorUsername : fallbackCreatorUrl ? parseSocialHandle(fallbackCreatorUrl) : null;
      const fallbackCreatorProvider = typeof token.fallbackCreatorProvider === "string" ? token.fallbackCreatorProvider : fallbackCreatorUrl ? "twitter" : null;
      const profile = publicProfile.imageUrl ? publicProfile : { imageUrl: feedToken?.imageUrl ?? null };
      const primaryCreator = creators.find((creator) => creator.isCreator) ?? creators[0] ?? {
        wallet: token.mint,
        provider: fallbackCreatorProvider ?? "unknown",
        providerUsername: fallbackCreatorUsername ?? null,
        username: fallbackCreatorUsername ?? null,
        pfp: null,
        royaltyBps: 0,
        royaltyPct: 0,
        isCreator: false
      };

      const claimablePositions = creators.length > 0 ? await getClaimablePositions(primaryCreator.wallet).catch(() => []) : [];
      const claimablePosition = claimablePositions.find((position) => position.baseMint === token.mint);
      const metric1h = tradeMap1h.get(token.mint);
      const metric6h = tradeMap6h.get(token.mint);
      const metric24h = tradeMap24h.get(token.mint);
      const metric7d = tradeMap7d.get(token.mint);
      const volumeUsd1h = metric1h?.volumeUsd ?? 0;
      const volumeUsd6h = metric6h?.volumeUsd ?? 0;
      const volumeUsd24h = metric24h?.volumeUsd ?? 0;
      const volumeUsd7d = metric7d?.volumeUsd ?? 0;
      const tradeCount1h = metric1h?.tradeCount ?? 0;
      const tradeCount6h = metric6h?.tradeCount ?? 0;
      const tradeCount24h = metric24h?.tradeCount ?? 0;
      const tradeCount7d = metric7d?.tradeCount ?? 0;
      const claimableSOL = claimablePosition ? Number(claimablePosition.totalClaimableLamportsUserShare ?? 0) / 1_000_000_000 : 0;
      const lifetimeEarnedSOL = lifetimeTotalSOL * ((primaryCreator.royaltyBps ?? 0) / 10000);
      const hasSocialCreator = Boolean(primaryCreator.provider && primaryCreator.provider !== "unknown" && (primaryCreator.providerUsername || primaryCreator.username));
      const aiFeatures = buildAiFeatureSet({
        token,
        publicProfile: profile,
        primaryCreator,
        lifetimeTotalSOL,
        lifetimeEarnedSOL,
        claimableSOL,
        volumeUsd1h,
        volumeUsd6h,
        volumeUsd24h,
        volumeUsd7d,
        tradeCount1h,
        tradeCount6h,
        tradeCount24h,
        tradeCount7d,
        hasSocialCreator,
        now
      });

      return {
        mint: token.mint,
        symbol: token.symbol,
        name: token.name,
        imageUrl: profile.imageUrl,
        launchCreatedAt: token.createdAt,
        discoverySource: token.discoverySource ?? null,
        creatorWallet: primaryCreator.wallet,
        creatorWalletShort: formatAddress(primaryCreator.wallet, 4, 4),
        creatorUsername: primaryCreator.providerUsername ?? primaryCreator.username ?? null,
        creatorProvider: primaryCreator.provider ?? null,
        creatorUrl: creatorProviderUrl(primaryCreator.provider ?? null, primaryCreator.providerUsername ?? primaryCreator.username ?? null) ?? fallbackCreatorUrl,
        creatorPfp: primaryCreator.pfp ?? null,
        lifetimeTotalSOL,
        lifetimeEarnedSOL,
        claimableSOL,
        royaltyBps: primaryCreator.royaltyBps ?? 0,
        royaltyPct: primaryCreator.royaltyPct,
        isGraduated: 1,
        bagsUrl: `https://bags.fm/${token.mint}`,
        volumeUsd1h,
        volumeUsd6h,
        volumeUsd24h,
        volumeUsd7d,
        tradeCount1h,
        tradeCount6h,
        tradeCount24h,
        tradeCount7d,
        aiReadinessScore: aiFeatures.aiReadinessScore,
        lastTradeAt: metric24h?.lastTradeAt ?? null,
        aiFeatures,
        syncedAt: now
      };
    });

    const scoredRows = applyCompositeRankScores(rows.filter((row) => row !== null));
    if (scoredRows.length === 0) {
      throw new Error("No leaderboard rows were enriched; keeping the existing leaderboard cache.");
    }
    const rowsWithCreatorData = scoredRows.filter((row) => row.creatorProvider && row.creatorProvider !== "unknown").length;
    const rowsWithRevenueData = scoredRows.filter((row) => row.lifetimeTotalSOL > 0 || row.lifetimeEarnedSOL > 0 || row.claimableSOL > 0).length;
    const hasExistingCache = getExistingLeaderboardCount(db) > 0;
    if (hasExistingCache && scoredRows.length >= 20 && rowsWithCreatorData === 0 && rowsWithRevenueData === 0) {
      throw new Error("Bags enrichment returned no creator or revenue data; keeping the existing leaderboard cache.");
    }
    const selectedRows = scoredRows
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, Math.min(scoredRows.length, syncLimit));

    const clearStmt = db.prepare("DELETE FROM leaderboard_entries");
    const clearAiStmt = db.prepare("DELETE FROM token_ai_features");
    const clearRecommendationStmt = db.prepare("DELETE FROM token_ai_recommendations");
    const insertStmt = db.prepare(`
      INSERT INTO leaderboard_entries (
        mint, symbol, name, image_url, creator_wallet, creator_wallet_short, creator_username, creator_provider, creator_url, creator_pfp,
        lifetime_total_sol, lifetime_earned_sol, claimable_sol, royalty_bps, royalty_pct, is_graduated, bags_url, discovery_source,
        volume_1h_usd, volume_6h_usd, volume_24h_usd, volume_7d_usd, trade_count_1h, trade_count_6h, trade_count_24h, trade_count_7d,
        launch_created_at, rank_score, momentum_score, ai_readiness_score, last_trade_at, source, synced_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    const insertAiStmt = db.prepare(`
      INSERT INTO token_ai_features (
        mint, age_hours, volume_growth_1h_vs_24h, volume_growth_24h_vs_7d, trade_velocity_1h, revenue_velocity_sol,
        has_metadata_image, has_social_creator, low_liquidity_risk, high_momentum, ai_summary_input_json,
        rank_reason, growth_reason, risk_reason, recommended_action, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertRecommendationStmt = db.prepare(`
      INSERT INTO token_ai_recommendations (
        mint, symbol, recommendation_type, stance, confidence, title, insight, action, evidence_json,
        model_provider, model_name, generated_at, source_snapshot_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const logStmt = db.prepare(`
      INSERT INTO leaderboard_sync_runs (status, source, message, tokens_seen, synced_entries, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    clearStmt.run();
    clearAiStmt.run();
    clearRecommendationStmt.run();
    for (const row of selectedRows) {
      insertStmt.run(
        row.mint,
        row.symbol,
        row.name,
        row.imageUrl,
        row.creatorWallet,
        row.creatorWalletShort,
        row.creatorUsername,
        row.creatorProvider,
        row.creatorUrl,
        row.creatorPfp,
        row.lifetimeTotalSOL,
        row.lifetimeEarnedSOL,
        row.claimableSOL,
        row.royaltyBps,
        row.royaltyPct,
        row.isGraduated,
        row.bagsUrl,
        row.discoverySource,
        row.volumeUsd1h,
        row.volumeUsd6h,
        row.volumeUsd24h,
        row.volumeUsd7d,
        row.tradeCount1h,
        row.tradeCount6h,
        row.tradeCount24h,
        row.tradeCount7d,
        row.launchCreatedAt,
        row.rankScore,
        row.momentumScore,
        row.aiReadinessScore,
        row.lastTradeAt,
        "bitquery+bags",
        row.syncedAt
      );
      insertAiStmt.run(
        row.mint,
        row.aiFeatures.ageHours,
        row.aiFeatures.volumeGrowth1hVs24h,
        row.aiFeatures.volumeGrowth24hVs7d,
        row.aiFeatures.tradeVelocity1h,
        row.aiFeatures.revenueVelocitySOL,
        row.aiFeatures.hasMetadataImage ? 1 : 0,
        row.aiFeatures.hasSocialCreator ? 1 : 0,
        row.aiFeatures.lowLiquidityRisk ? 1 : 0,
        row.aiFeatures.highMomentum ? 1 : 0,
        JSON.stringify(row.aiFeatures.aiSummaryInput),
        row.aiFeatures.rankReason,
        row.aiFeatures.growthReason,
        row.aiFeatures.riskReason,
        row.aiFeatures.recommendedAction,
        now
      );
      const recommendation = buildTokenRecommendation(row);
      insertRecommendationStmt.run(
        row.mint,
        row.symbol,
        recommendation.recommendationType,
        recommendation.stance,
        recommendation.confidence,
        recommendation.title,
        recommendation.insight,
        recommendation.action,
        JSON.stringify(recommendation.evidence),
        "rules",
        "bagssignal-rules-v1",
        now,
        row.syncedAt
      );
    }

    logStmt.run(
      "success",
      "bitquery+bags",
      `Tracked active universe: rank score blends creator earnings, claimable revenue, 1h/24h/7d volume, trade count, launch momentum, and AI-ready risk features.`,
      discovered.length,
      selectedRows.length,
      now
    );
    return { syncedEntries: selectedRows.length, tokensSeen: discovered.length };
  } catch (error) {
    db.prepare(`
      INSERT INTO leaderboard_sync_runs (status, source, message, tokens_seen, synced_entries, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "failed",
      "bitquery+bags",
      error instanceof Error ? error.message : "Unknown sync failure",
      0,
      0,
      now
    );
    throw error;
  }
}

function getExistingLeaderboardCount(db: ReturnType<typeof getDb>) {
  const row = db.prepare("SELECT count(*) as total FROM leaderboard_entries").get() as { total: number };
  return Number(row.total);
}

function applyCompositeRankScores<
  T extends {
    lifetimeEarnedSOL: number;
    claimableSOL: number;
    volumeUsd24h: number;
    tradeCount24h: number;
    launchCreatedAt: string;
  }
>(rows: T[]) {
  const maxRevenue = Math.max(...rows.map((row) => row.lifetimeEarnedSOL), 1);
  const maxClaimable = Math.max(...rows.map((row) => row.claimableSOL), 1);
  const maxVolume = Math.max(...rows.map((row) => row.volumeUsd24h), 1);
  const maxTradeCount = Math.max(...rows.map((row) => row.tradeCount24h), 1);

  return rows.map((row) => {
    const revenueScore = normalizeLog(row.lifetimeEarnedSOL, maxRevenue);
    const claimableScore = normalizeLog(row.claimableSOL, maxClaimable);
    const volumeScore = normalizeLog(row.volumeUsd24h, maxVolume);
    const tradeScore = normalizeLog(row.tradeCount24h, maxTradeCount);
    const momentumScore = buildMomentumScore(row.launchCreatedAt, tradeScore, volumeScore);

    const rankScore =
      revenueScore * 0.4 +
      volumeScore * 0.25 +
      claimableScore * 0.15 +
      tradeScore * 0.1 +
      momentumScore * 0.1;

    return {
      ...row,
      rankScore: Number(rankScore.toFixed(4)),
      momentumScore: Number(momentumScore.toFixed(4))
    };
  });
}

function buildActiveScore({
  volumeUsd24h,
  tradeCount24h,
  lifetimeEarnedSOL,
  claimableSOL
}: {
  volumeUsd24h: number;
  tradeCount24h: number;
  lifetimeEarnedSOL: number;
  claimableSOL: number;
}) {
  return (
    volumeUsd24h * 0.55 +
    tradeCount24h * 8 +
    lifetimeEarnedSOL * 120 +
    claimableSOL * 60
  );
}

function buildAiFeatureSet({
  token,
  publicProfile,
  primaryCreator,
  lifetimeTotalSOL,
  lifetimeEarnedSOL,
  claimableSOL,
  volumeUsd1h,
  volumeUsd6h,
  volumeUsd24h,
  volumeUsd7d,
  tradeCount1h,
  tradeCount6h,
  tradeCount24h,
  tradeCount7d,
  hasSocialCreator,
  now
}: {
  token: { mint: string; symbol: string; name: string; createdAt: string; discoverySource?: string };
  publicProfile: { imageUrl: string | null };
  primaryCreator: {
    wallet: string;
    provider?: string | null;
    providerUsername?: string | null;
    username?: string | null;
    royaltyBps?: number;
  };
  lifetimeTotalSOL: number;
  lifetimeEarnedSOL: number;
  claimableSOL: number;
  volumeUsd1h: number;
  volumeUsd6h: number;
  volumeUsd24h: number;
  volumeUsd7d: number;
  tradeCount1h: number;
  tradeCount6h: number;
  tradeCount24h: number;
  tradeCount7d: number;
  hasSocialCreator: boolean;
  now: string;
}) {
  const ageHours = Math.max((new Date(now).getTime() - new Date(token.createdAt).getTime()) / 3_600_000, 0);
  const hourlyVolume24h = volumeUsd24h / 24;
  const dailyVolume7d = volumeUsd7d / 7;
  const volumeGrowth1hVs24h = safeRatio(volumeUsd1h, hourlyVolume24h);
  const volumeGrowth24hVs7d = safeRatio(volumeUsd24h, dailyVolume7d);
  const tradeVelocity1h = safeRatio(tradeCount1h, Math.max(tradeCount24h / 24, 1));
  const revenueVelocitySOL = safeRatio(lifetimeEarnedSOL, Math.max(ageHours, 1));
  const hasMetadataImage = Boolean(publicProfile.imageUrl);
  const lowLiquidityRisk = volumeUsd24h < 100 && tradeCount24h < 5;
  const highMomentum = volumeGrowth1hVs24h >= 2 || volumeGrowth24hVs7d >= 1.6 || tradeVelocity1h >= 2;
  const aiReadinessScore = Number((
    (volumeUsd24h > 0 ? 0.24 : 0) +
    (volumeUsd7d > 0 ? 0.2 : 0) +
    (tradeCount24h > 0 ? 0.18 : 0) +
    (lifetimeTotalSOL > 0 ? 0.14 : 0) +
    (hasMetadataImage ? 0.12 : 0) +
    (hasSocialCreator ? 0.12 : 0)
  ).toFixed(2));

  const rankReason = [
    lifetimeEarnedSOL > 0 ? `${token.symbol} has ${lifetimeEarnedSOL.toFixed(4)} SOL creator earnings` : null,
    volumeUsd24h > 0 ? `$${volumeUsd24h.toFixed(0)} 24h volume` : null,
    tradeCount24h > 0 ? `${tradeCount24h} trades in 24h` : null
  ].filter(Boolean).join(", ") || "Limited trading and revenue data is available so far.";
  const growthReason = highMomentum
    ? "Recent activity is accelerating versus its trailing baseline."
    : "Recent activity is steady or still forming a reliable trend.";
  const riskReason = lowLiquidityRisk
    ? "Low 24h volume and sparse trades make this token harder to analyze with confidence."
    : "Trading activity is sufficient for a first-pass AI read.";
  const recommendedAction = highMomentum
    ? "Prioritize creator outreach, holder review, and campaign timing while momentum is fresh."
    : "Monitor for stronger volume, holder, and claim signals before making a high-conviction recommendation.";

  return {
    ageHours: Number(ageHours.toFixed(2)),
    volumeGrowth1hVs24h: Number(volumeGrowth1hVs24h.toFixed(4)),
    volumeGrowth24hVs7d: Number(volumeGrowth24hVs7d.toFixed(4)),
    tradeVelocity1h: Number(tradeVelocity1h.toFixed(4)),
    revenueVelocitySOL: Number(revenueVelocitySOL.toFixed(8)),
    hasMetadataImage,
    hasSocialCreator,
    lowLiquidityRisk,
    highMomentum,
    aiReadinessScore,
    rankReason,
    growthReason,
    riskReason,
    recommendedAction,
    aiSummaryInput: {
      token: {
        mint: token.mint,
        symbol: token.symbol,
        name: token.name,
        imageUrl: publicProfile.imageUrl,
        bagsUrl: `https://bags.fm/${token.mint}`,
        discoverySource: token.discoverySource ?? null,
        createdAt: token.createdAt,
        ageHours: Number(ageHours.toFixed(2))
      },
      creator: {
        wallet: primaryCreator.wallet,
        provider: primaryCreator.provider ?? null,
        handle: primaryCreator.providerUsername ?? primaryCreator.username ?? null,
        royaltyBps: primaryCreator.royaltyBps ?? 0,
        hasSocialCreator
      },
      revenue: {
        lifetimeTotalSOL,
        lifetimeEarnedSOL,
        claimableSOL,
        revenueVelocitySOL: Number(revenueVelocitySOL.toFixed(8))
      },
      trading: {
        volumeUsd1h,
        volumeUsd6h,
        volumeUsd24h,
        volumeUsd7d,
        tradeCount1h,
        tradeCount6h,
        tradeCount24h,
        tradeCount7d,
        volumeGrowth1hVs24h: Number(volumeGrowth1hVs24h.toFixed(4)),
        volumeGrowth24hVs7d: Number(volumeGrowth24hVs7d.toFixed(4)),
        tradeVelocity1h: Number(tradeVelocity1h.toFixed(4))
      },
      risk: {
        lowLiquidityRisk,
        highMomentum,
        hasMetadataImage,
        aiReadinessScore
      }
    }
  };
}

function buildTokenRecommendation(row: {
  symbol: string;
  rankScore: number;
  momentumScore: number;
  volumeUsd24h: number;
  tradeCount24h: number;
  lifetimeEarnedSOL: number;
  claimableSOL: number;
  aiReadinessScore: number;
  aiFeatures: {
    lowLiquidityRisk: boolean;
    highMomentum: boolean;
    hasSocialCreator: boolean;
  };
}) {
  const evidence = {
    rankScore: row.rankScore,
    momentumScore: row.momentumScore,
    volume24hUsd: Number(row.volumeUsd24h.toFixed(2)),
    tradeCount24h: row.tradeCount24h,
    lifetimeEarnedSOL: Number(row.lifetimeEarnedSOL.toFixed(4)),
    claimableSOL: Number(row.claimableSOL.toFixed(4)),
    aiReadinessScore: row.aiReadinessScore,
    lowLiquidityRisk: row.aiFeatures.lowLiquidityRisk,
    highMomentum: row.aiFeatures.highMomentum
  };

  if (row.aiFeatures.lowLiquidityRisk && row.rankScore >= 0.24) {
    return {
      recommendationType: "risk" as const,
      stance: "cautious" as const,
      confidence: row.aiReadinessScore >= 0.55 ? "medium" as const : "low" as const,
      title: "Score needs liquidity confirmation",
      insight: `${row.symbol} ranks well, but recent trading is too thin to treat the signal as durable yet.`,
      action: "Wait for stronger trade count or holder activity before making it a priority.",
      evidence
    };
  }

  if (row.momentumScore >= 0.65 && row.volumeUsd24h >= 500) {
    return {
      recommendationType: "momentum" as const,
      stance: "bullish" as const,
      confidence: row.aiReadinessScore >= 0.8 ? "high" as const : "medium" as const,
      title: "Strong near-term momentum",
      insight: `${row.symbol} combines active trading with fresh momentum, making it one of the better near-term opportunities in the cache.`,
      action: "Use the current momentum window for creator distribution and community follow-up.",
      evidence
    };
  }

  if (row.lifetimeEarnedSOL >= 10 || row.claimableSOL >= 1) {
    return {
      recommendationType: "revenue" as const,
      stance: row.volumeUsd24h > 0 ? "watch" as const : "cautious" as const,
      confidence: row.aiReadinessScore >= 0.5 ? "medium" as const : "low" as const,
      title: "Proven revenue, watch activity",
      insight: `${row.symbol} has meaningful creator revenue, but the next read depends on whether recent trading continues.`,
      action: row.claimableSOL > 0 ? "Claim or benchmark this revenue before the next campaign." : "Track the next sync for renewed trading activity.",
      evidence
    };
  }

  if (row.aiReadinessScore >= 0.8 && row.rankScore >= 0.18) {
    return {
      recommendationType: "hidden_gem" as const,
      stance: "watch" as const,
      confidence: "medium" as const,
      title: "Clean signal worth tracking",
      insight: `${row.symbol} has enough trading, metadata, and creator context to monitor even if it is not leading the board yet.`,
      action: "Keep it on the watchlist and compare its next 24h volume against this snapshot.",
      evidence
    };
  }

  return {
    recommendationType: "creator_action" as const,
    stance: "watch" as const,
    confidence: row.aiReadinessScore >= 0.4 ? "medium" as const : "low" as const,
    title: "Early signal, wait for confirmation",
    insight: `${row.symbol} has limited evidence right now, so the best read is to monitor rather than overreact.`,
    action: "Wait for stronger volume, claimable revenue, or social traction before prioritizing it.",
    evidence
  };
}

function safeRatio(value: number, baseline: number) {
  if (value <= 0) return 0;
  if (baseline <= 0) return value;
  return value / baseline;
}

function parseSocialHandle(url: string) {
  try {
    const parsed = new URL(url);
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle?.replace(/^@/, "") || null;
  } catch {
    const match = url.match(/(?:x\.com|twitter\.com)\/@?([^/?#]+)/i);
    return match?.[1] ?? null;
  }
}

function normalizeLog(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0;
  return Math.log1p(value) / Math.log1p(max);
}

function buildMomentumScore(launchCreatedAt: string, tradeScore: number, volumeScore: number) {
  const ageHours = Math.max((Date.now() - new Date(launchCreatedAt).getTime()) / 3_600_000, 0);
  const recencyScore = Math.max(0, 1 - ageHours / 168);
  return tradeScore * 0.55 + volumeScore * 0.2 + recencyScore * 0.25;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
