import type { TokenDetail, TokenPosition } from "@/lib/types";

export const INSIGHT_SYSTEM_PROMPT = `
You are an expert DeFi revenue advisor for the Bags.fm platform on Solana.
Your job is to analyze a creator's token fee revenue data and generate 2-3 concise, actionable insights.

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no preamble.
- Each insight must follow this exact TypeScript interface:
  { id: string, icon: string, title: string, body: string, priority: "high"|"medium"|"low", actionLabel: string|null, actionRoute: string|null }
- All text (title, body, actionLabel) must be in English.
- Keep each "body" under 2 sentences, max 50 words.
- Use concrete numbers from the data provided.
- Prioritize insights in this order:
  1. Immediate claim opportunity
  2. Top performing token
  3. Fee configuration tips
  4. General growth observations
- Do NOT generate vague advice.
- Insight IDs must be unique snake_case strings.
- actionRoute must be a valid relative path or null.
`.trim();

export const TOKEN_INSIGHT_SYSTEM_PROMPT = `
You are an expert DeFi revenue advisor for the Bags.fm platform on Solana.
Your job is to analyze a single token's fee data and generate exactly 2 concise, actionable insights.

Rules:
- Return ONLY a valid JSON array with exactly 2 items.
- Follow the same InsightCard interface.
- All text must be in English.
- Keep each body under 40 words.
- Focus on claim timing advice, revenue trend, or fee configuration suggestions.
- Do NOT repeat generic advice.
`.trim();

export function buildInsightUserPrompt(context: {
  totalClaimableSOL: number;
  totalLifetimeEarnedSOL: number;
  tokenCount: number;
  tokens: TokenPosition[];
}) {
  return `
Here is the creator's current earnings data on Bags.fm:

SUMMARY:
- Total claimable right now: ${context.totalClaimableSOL.toFixed(4)} SOL
- Lifetime earnings (creator share): ${context.totalLifetimeEarnedSOL.toFixed(4)} SOL
- Number of tokens: ${context.tokenCount}

TOKEN BREAKDOWN:
${context.tokens
  .map(
    (token) => `
- Symbol: $${token.symbol}
  Claimable: ${token.claimableSOL.toFixed(4)} SOL
  Lifetime Earned: ${token.lifetimeEarnedSOL.toFixed(4)} SOL
  Creator Share: ${token.royaltyPct}%
  Status: ${token.isMigrated ? "Graduated (DAMM V2 pool)" : "Bonding Curve"}
  Fee Mode: ${token.feeMode}
`
  )
  .join("")}

Generate 2-3 insights as a JSON array. Be specific, actionable, and reference real numbers from the data above.
  `.trim();
}

export function buildTokenInsightPrompt(token: TokenDetail) {
  const latestClaim = token.claimHistory[0];
  const lastClaimDaysAgo = latestClaim
    ? Math.max(0, Math.floor((Date.now() - new Date(latestClaim.timestamp).getTime()) / 86_400_000))
    : "unknown";

  return `
Token data for $${token.symbol} (Mint: ${token.mint}):

- Claimable now: ${token.claimableSOL.toFixed(4)} SOL
- My lifetime earnings: ${token.lifetimeEarnedSOL.toFixed(4)} SOL
- Total protocol fees ever: ${token.lifetimeTotalSOL.toFixed(4)} SOL
- My creator share: ${token.royaltyPct}%
- Status: ${token.isMigrated ? "Graduated (trading on DAMM V2)" : "Still on Bonding Curve"}
- Fee mode: ${token.feeMode}
- Collaborators: ${token.collaborators}
- Days since last claim: ${lastClaimDaysAgo}

Generate exactly 2 insights as a JSON array. Focus on whether to claim now, plus one fee-config or trend observation.
  `.trim();
}
