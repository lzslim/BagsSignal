export type DashboardSummary = {
  totalClaimableSOL: number;
  totalLifetimeEarnedSOL: number;
  totalLifetimeFeesSOL: number;
  tokenCount: number;
  collaboratorCount: number;
};

export type Creator = {
  wallet: string;
  provider: string | null;
  providerUsername?: string | null;
  username?: string | null;
  pfp?: string | null;
  royaltyBps: number;
  royaltyPct: number;
  isCreator: boolean;
  isAdmin?: boolean;
  isMe?: boolean;
  totalClaimedSOL?: number;
};

export type TokenPosition = {
  mint: string;
  symbol: string;
  name: string;
  pfp?: string | null;
  claimableSOL: number;
  lifetimeTotalSOL: number;
  lifetimeEarnedSOL: number;
  royaltyBps: number;
  royaltyPct: number;
  isCustomFeeVault: boolean;
  isMigrated: boolean;
  collaborators: number;
  feeMode: string;
};

export type DashboardResponse = {
  demoMode: boolean;
  simulatedWallet?: string | null;
  summary: DashboardSummary;
  tokens: TokenPosition[];
  chart: Array<{ date: string; amount: number }>;
};

export type ClaimEvent = {
  mint: string;
  wallet: string;
  amountSOL: number;
  timestamp: string;
  txHash: string;
  solscanUrl: string;
};

export type ClaimHistoryResponse = {
  demoMode?: boolean;
  source?: "bags-api" | "leaderboard-cache" | "demo";
  simulatedWallet?: string | null;
  events: ClaimEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type SimulatedWallet = {
  wallet: string;
  walletShort: string;
  label: string;
  provider: string | null;
  tokenCount: number;
  lifetimeEarnedSOL: number;
  claimableSOL: number;
  topTokenSymbol: string;
};

export type TokenDetail = TokenPosition & {
  creators: Creator[];
  claimHistory: ClaimEvent[];
};

export type LeaderboardEntry = {
  rank: number;
  mint: string;
  symbol: string;
  name?: string | null;
  imageUrl?: string | null;
  creatorWallet: string;
  creatorWalletShort: string;
  creatorUsername: string | null;
  creatorProvider: string | null;
  creatorUrl?: string | null;
  creatorPfp: string | null;
  lifetimeTotalSOL: number;
  lifetimeEarnedSOL: number;
  claimableSOL: number;
  royaltyBps: number;
  royaltyPct: number;
  isGraduated: boolean;
  rankScore?: number;
  momentumScore?: number;
  volume1hUsd?: number;
  volume6hUsd?: number;
  volume24hUsd?: number;
  volume7dUsd?: number;
  tradeCount1h?: number;
  tradeCount6h?: number;
  tradeCount24h?: number;
  tradeCount7d?: number;
  aiReadinessScore?: number;
  aiRecommendation?: TokenAIRecommendation | null;
  isMe?: boolean;
};

export type TokenAIRecommendation = {
  recommendationType: "momentum" | "revenue" | "risk" | "hidden_gem" | "creator_action";
  stance: "bullish" | "watch" | "cautious" | "risk";
  confidence: "high" | "medium" | "low";
  title: string;
  insight: string;
  action: string;
  evidence: {
    rankScore: number;
    momentumScore: number;
    volume24hUsd: number;
    tradeCount24h: number;
    lifetimeEarnedSOL: number;
    claimableSOL: number;
    aiReadinessScore: number;
    lowLiquidityRisk?: boolean;
    highMomentum?: boolean;
  };
  generatedAt?: string;
};

export type LeaderboardResponse = {
  demoMode?: boolean;
  stats: {
    totalCreators: number;
    totalFeesSOL: number;
    topEarnerSOL: number;
  };
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type InsightCard = {
  id: string;
  icon: string;
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  actionLabel: string | null;
  actionRoute: string | null;
};

export type AIInsightsResponse = {
  provider: string;
  insights: InsightCard[];
  generatedAt: number;
  demoMode?: boolean;
};
