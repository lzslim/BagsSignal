import type { AIInsightsResponse, DashboardResponse, LeaderboardResponse, TokenDetail } from "@/lib/types";

export const mockWallet = "8xX3R3VenueBagsCreatorWallet9bc9f111111111";

export const mockDashboard: DashboardResponse = {
  demoMode: true,
  summary: {
    totalClaimableSOL: 12.48,
    totalLifetimeEarnedSOL: 847.23,
    totalLifetimeFeesSOL: 1964.7,
    tokenCount: 6,
    collaboratorCount: 3
  },
  chart: [
    { date: "Apr 30", amount: 2.4 },
    { date: "May 01", amount: 4.1 },
    { date: "May 02", amount: 3.7 },
    { date: "May 03", amount: 7.2 },
    { date: "May 04", amount: 8.8 },
    { date: "May 05", amount: 11.3 },
    { date: "May 06", amount: 12.48 }
  ],
  tokens: [
    {
      mint: "CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS",
      symbol: "BAGS",
      name: "Bags Creator Token",
      pfp: null,
      claimableSOL: 2.34,
      lifetimeTotalSOL: 912.1,
      lifetimeEarnedSOL: 45.6,
      royaltyBps: 500,
      royaltyPct: 5,
      isCustomFeeVault: false,
      isMigrated: true,
      collaborators: 2,
      feeMode: "Default"
    },
    {
      mint: "HACKtn11111111111111111111111111111111111111",
      symbol: "HACK",
      name: "Hackathon Alpha",
      pfp: null,
      claimableSOL: 4.92,
      lifetimeTotalSOL: 603.4,
      lifetimeEarnedSOL: 241.36,
      royaltyBps: 4000,
      royaltyPct: 40,
      isCustomFeeVault: true,
      isMigrated: true,
      collaborators: 3,
      feeMode: "Custom"
    },
    {
      mint: "AGENT111111111111111111111111111111111111111",
      symbol: "AGENT",
      name: "Agent Flow",
      pfp: null,
      claimableSOL: 1.76,
      lifetimeTotalSOL: 221.8,
      lifetimeEarnedSOL: 55.45,
      royaltyBps: 2500,
      royaltyPct: 25,
      isCustomFeeVault: true,
      isMigrated: false,
      collaborators: 1,
      feeMode: "High Flat"
    },
    {
      mint: "PAY11111111111111111111111111111111111111111",
      symbol: "PAY",
      name: "Creator Payments",
      pfp: null,
      claimableSOL: 3.46,
      lifetimeTotalSOL: 227.4,
      lifetimeEarnedSOL: 504.82,
      royaltyBps: 9000,
      royaltyPct: 90,
      isCustomFeeVault: false,
      isMigrated: true,
      collaborators: 1,
      feeMode: "Default"
    }
  ]
};

export function mockTokenDetail(mint: string): TokenDetail {
  const token = mockDashboard.tokens.find((item) => item.mint === mint) ?? mockDashboard.tokens[0];
  return {
    ...token,
    creators: [
      {
        wallet: mockWallet,
        provider: "twitter",
        providerUsername: "bags_builder",
        username: "bags_builder",
        pfp: null,
        royaltyBps: token.royaltyBps,
        royaltyPct: token.royaltyPct,
        isCreator: true,
        isAdmin: true,
        isMe: true,
        totalClaimedSOL: token.lifetimeEarnedSOL
      },
      {
        wallet: "5pARTnerBagsFeeShareWallet111111111111111111",
        provider: "github",
        providerUsername: "partner-labs",
        username: "partner-labs",
        pfp: null,
        royaltyBps: Math.max(0, 10000 - token.royaltyBps),
        royaltyPct: Math.max(0, 100 - token.royaltyPct),
        isCreator: false,
        isMe: false,
        totalClaimedSOL: 18.42
      }
    ],
    claimHistory: [
      {
        mint: token.mint,
        wallet: mockWallet,
        amountSOL: 1.23,
        timestamp: "2026-05-01T14:32:00.000Z",
        txHash: "3mQkBagsDemoTx111111111111111111111111111111111",
        solscanUrl: "https://solscan.io/tx/3mQkBagsDemoTx111111111111111111111111111111111"
      },
      {
        mint: token.mint,
        wallet: mockWallet,
        amountSOL: 0.89,
        timestamp: "2026-04-15T09:17:00.000Z",
        txHash: "4nQkBagsDemoTx222222222222222222222222222222222",
        solscanUrl: "https://solscan.io/tx/4nQkBagsDemoTx222222222222222222222222222222222"
      }
    ]
  };
}

export const mockLeaderboard: LeaderboardResponse = {
  demoMode: true,
  stats: {
    totalCreators: 8,
    totalFeesSOL: 5240.88,
    topEarnerSOL: 1276.42
  },
  entries: [
    {
      rank: 1,
      mint: mockDashboard.tokens[1].mint,
      symbol: "HACK",
      name: "Hackathon Alpha",
      imageUrl: null,
      creatorWallet: mockWallet,
      creatorWalletShort: "8xX3...1111",
      creatorUsername: "bags_builder",
      creatorProvider: "twitter",
      creatorUrl: "https://x.com/bags_builder",
      creatorPfp: null,
      lifetimeTotalSOL: 3191.04,
      lifetimeEarnedSOL: 1276.42,
      claimableSOL: 4.92,
      royaltyBps: 4000,
      royaltyPct: 40,
      isGraduated: true,
      rankScore: 0.98,
      momentumScore: 0.82
    },
    {
      rank: 2,
      mint: mockDashboard.tokens[3].mint,
      symbol: "PAY",
      name: "Creator Payments",
      imageUrl: null,
      creatorWallet: "6hNPayCreatorWallet111111111111111111111111111",
      creatorWalletShort: "6hNP...1111",
      creatorUsername: "yieldpilot",
      creatorProvider: "github",
      creatorUrl: "https://github.com/yieldpilot",
      creatorPfp: null,
      lifetimeTotalSOL: 1082.4,
      lifetimeEarnedSOL: 974.16,
      claimableSOL: 3.46,
      royaltyBps: 9000,
      royaltyPct: 90,
      isGraduated: true,
      rankScore: 0.71,
      momentumScore: 0.42
    },
    {
      rank: 3,
      mint: mockDashboard.tokens[2].mint,
      symbol: "AGENT",
      name: "Agent Flow",
      imageUrl: null,
      creatorWallet: "4g7AgentCreatorWallet1111111111111111111111111",
      creatorWalletShort: "4g7A...1111",
      creatorUsername: "agent_flow",
      creatorProvider: "twitter",
      creatorUrl: "https://x.com/agent_flow",
      creatorPfp: null,
      lifetimeTotalSOL: 221.8,
      lifetimeEarnedSOL: 55.45,
      claimableSOL: 1.76,
      royaltyBps: 2500,
      royaltyPct: 25,
      isGraduated: false,
      rankScore: 0.56,
      momentumScore: 0.77
    },
    {
      rank: 4,
      mint: mockDashboard.tokens[0].mint,
      symbol: "BAGS",
      name: "Bags Creator Token",
      imageUrl: null,
      creatorWallet: "BagSNativeCreator11111111111111111111111111111",
      creatorWalletShort: "BagS...1111",
      creatorUsername: "bagsnative",
      creatorProvider: "twitter",
      creatorUrl: "https://x.com/bagsnative",
      creatorPfp: null,
      lifetimeTotalSOL: 912.1,
      lifetimeEarnedSOL: 45.6,
      claimableSOL: 2.34,
      royaltyBps: 500,
      royaltyPct: 5,
      isGraduated: true,
      rankScore: 0.48,
      momentumScore: 0.31
    }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 4,
    totalPages: 1
  }
};

export const mockAIInsights: AIInsightsResponse = {
  provider: "demo",
  demoMode: true,
  generatedAt: Date.now(),
  insights: [
    {
      id: "claim_opportunity",
      icon: "Sparkles",
      title: "Claim opportunity",
      body: "You have 12.48 SOL ready to claim across 6 tokens. Claiming now keeps balances tidy and lets you monitor new revenue from a clean baseline.",
      priority: "high",
      actionLabel: "Claim all",
      actionRoute: "/dashboard"
    },
    {
      id: "top_performer",
      icon: "Trophy",
      title: "Top performer",
      body: "$HACK is your strongest token with 241.36 SOL in creator earnings and 4.92 SOL still claimable. It is the clearest candidate for deeper promotion.",
      priority: "medium",
      actionLabel: "View token",
      actionRoute: `/dashboard/token/${mockDashboard.tokens[1].mint}`
    },
    {
      id: "fee_config_tip",
      icon: "Gauge",
      title: "Fee configuration tip",
      body: "Tokens still using default fee behavior may be leaving creator upside on the table. Review fee mode for low-volume tokens before their next growth push.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    }
  ]
};

export function mockTokenAIInsights(mint: string): AIInsightsResponse {
  const token = mockDashboard.tokens.find((item) => item.mint === mint) ?? mockDashboard.tokens[0];
  return {
    provider: "demo",
    demoMode: true,
    generatedAt: Date.now(),
    insights: [
      {
        id: "claim_timing",
        icon: "Clock3",
        title: "Claim timing",
        body: `You have ${token.claimableSOL.toFixed(2)} SOL claimable on $${token.symbol}. A weekly claim cadence is a clean default while volume remains steady.`,
        priority: "high",
        actionLabel: "Review wallet",
        actionRoute: "/dashboard"
      },
      {
        id: "revenue_trend",
        icon: "TrendingUp",
        title: "Revenue trend",
        body: `$${token.symbol} has generated ${token.lifetimeEarnedSOL.toFixed(2)} SOL for your share so far. ${token.isMigrated ? "Graduated status suggests healthy secondary activity." : "Bonding curve status means fee behavior can still shift quickly."}`,
        priority: "medium",
        actionLabel: null,
        actionRoute: null
      }
    ]
  };
}
