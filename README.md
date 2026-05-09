<div align="center">

# BagsSignal

### Creator Revenue Intelligence for the Bags Ecosystem

![license](https://img.shields.io/badge/license-MIT-blue)
![network](https://img.shields.io/badge/network-Solana%20Mainnet-14F195)
![protocol](https://img.shields.io/badge/protocol-Bags-02FF40)
![data](https://img.shields.io/badge/data-Bags%20API%20%2B%20Bitquery-orange)
![ai](https://img.shields.io/badge/AI-Revenue%20Signals-purple)

[GitHub](https://github.com/lzslim/BagsSignal) | [Bags](https://bags.fm) | [DoraHacks](https://dorahacks.io/hackathon/the-bags-hackathon/detail#about-bags)

</div>

BagsSignal is a creator intelligence dashboard for the Bags ecosystem. It helps creators understand fee revenue, claimable earnings, token momentum, and market signals across Bags-launched tokens.

Creators on Bags can earn from token activity, but the important signals are spread across wallets, token pages, claim events, and trading data. BagsSignal brings those signals into one workflow so creators can answer:

- Which tokens are earning?
- Which fees are ready to claim?
- Which tokens are gaining market momentum?
- Which creator actions should happen next?

## Core Features

- Wallet-level creator revenue dashboard.
- Claimable fee and lifetime earnings overview.
- Creator token cards with Bags token page links.
- Fee claim history view.
- Active Bags creator leaderboard.
- AI Revenue Advisor for creator actions.
- AI Market Read for leaderboard-level insights.
- Per-token AI Signal with evidence metrics.

## Dashboard

The Dashboard is the creator-facing workspace. After connecting a wallet, creators can review Bags fee activity across their tokens:

- Total ready-to-claim fees.
- Lifetime creator earnings.
- Total fees generated.
- Revenue trend visualization.
- Creator token list.
- Individual claim actions.
- Direct token links to Bags.

### AI Revenue Advisor

The AI Revenue Advisor turns creator revenue context into short, action-oriented recommendations. It focuses on:

- `Claim Timing`: whether it is a good moment to claim fees.
- `Top Token Focus`: which token deserves the next creator push.
- `Growth Signal`: whether market activity suggests promotion, monitoring, or caution.

The advisor is designed to be concise and practical. It does not simply repeat metrics; it translates fee and token activity into creator actions.

## History

The History page shows fee claim activity for a wallet. Claim events include:

- Token mint.
- Claimed SOL amount.
- Claim time.
- Transaction or Bags token page link.

This gives creators a clean way to review past fee collection and understand how revenue has moved over time.

## Leaderboard

The Leaderboard ranks active Bags token creators using creator revenue, claimable fees, trading activity, and momentum. It is designed to highlight tokens that are not only historically successful, but also currently active.

The page includes:

- Top creator podium.
- Searchable token table.
- Token image, symbol, name, and contract address.
- Creator social identity when available.
- Lifetime earned and claimable fees.
- Bags token page link.
- AI Market Read.
- Expandable AI Signal cards.

### Ranking Formula

BagsSignal calculates a normalized composite score:

```text
+--------------------------------------------------------------------------------+
|                          BagsSignal Ranking Engine                             |
+--------------------------------------------------------------------------------+
|                                                                                |
|  Raw Bags + Market Inputs                                                      |
|                                                                                |
|   +------------------+     +------------------+     +------------------+       |
|   | Creator Earnings |     |    24h Volume    |     | Claimable Fees   |       |
|   | Lifetime SOL     |     | DEX Volume USD   |     | Ready to Claim   |       |
|   +--------+---------+     +--------+---------+     +--------+---------+       |
|            |                        |                        |                 |
|            v                        v                        v                 |
|   +--------------------------------------------------------------------+       |
|   |                    Log Normalization Layer                         |       |
|   |    Prevents one extreme token from dominating the full ranking.    |       |
|   +--------+-----------------------+-----------------------+-----------+       |
|            |                       |                       |                   |
|            v                       v                       v                   |
|    40% Creator Earnings      25% 24h Volume        15% Claimable Fees         |
|                                                                                |
|   +------------------+                              +------------------+       |
|   | Trade Activity   |                              | Momentum Signal  |       |
|   | 24h Trade Count  |                              | Trades + Volume  |       |
|   +--------+---------+                              | + Launch Recency |       |
|            |                                        +--------+---------+       |
|            v                                                 v                 |
|     10% Trade Activity                               10% Momentum              |
|                                                                                |
|           +------------------------------------------------------+             |
|           | Final Score = 40% earnings + 25% volume             |             |
|           |             + 15% claimable + 10% trades            |             |
|           |             + 10% momentum                          |             |
|           +--------------------------+---------------------------+             |
|                                      |                                         |
|                                      v                                         |
|                          Ranked Creator Leaderboard                           |
|                                                                                |
+--------------------------------------------------------------------------------+
```

Revenue, claimable fees, volume, and trade activity are log-normalized so one extreme value does not dominate the board.

Momentum is calculated from:

```text
Momentum = 55% trade score + 20% volume score + 25% recency score
```

This makes the ranking more balanced: proven earning power matters most, but active market demand and recent movement also influence placement.

### AI Signal

Each leaderboard token can expose an AI Signal with:

- Stance: bullish, watch, cautious, or risk.
- Signal strength: Strong Signal, Developing Signal, or Needs More Data.
- Short insight.
- Recommended action.
- Evidence metrics.

The signal uses features such as:

- 1h, 6h, 24h, and 7d volume.
- 1h, 6h, 24h, and 7d trade count.
- Volume growth ratios.
- Trade velocity.
- Revenue velocity.
- Metadata quality.
- Creator social context.
- Liquidity and momentum risk flags.

## Data Pipeline

BagsSignal combines Bags API data, Solana on-chain metadata, Bitquery trading data, and local SQLite storage.

### Bags API

Bags API powers core creator and fee data:

- Claimable positions.
- Lifetime token fees.
- Token creators.
- Token launch feed.
- Claim events.
- Claim transaction preparation.

### On-Chain Metadata

Token images are resolved from Solana token metadata through `@solana/web3.js`. BagsSignal reads the Metaplex metadata PDA, extracts the metadata URI, and resolves token image data when available.

### Bitquery

Bitquery GraphQL is used to discover active Bags mints and collect trading metrics:

- Bags-related token launch activity.
- Active Bags token trading.
- 1h, 6h, 24h, and 7d DEX volume.
- Trade counts.
- Last trade time.

### SQLite

Enriched leaderboard rows and AI-ready features are stored locally in SQLite. The UI reads from this local data layer for fast page loads while the sync pipeline keeps the leaderboard current.

Main tables:

- `leaderboard_entries`
- `token_ai_features`
- `token_ai_recommendations`
- `leaderboard_sync_runs`

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- SWR
- Recharts
- Solana Wallet Adapter
- `@solana/web3.js`
- Bags API
- Bitquery GraphQL
- SQLite
- Anthropic / OpenAI-compatible AI provider architecture

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Run type checking:

```bash
npm run typecheck
```

## Vision

BagsSignal is a signal layer for Bags creators. It turns creator revenue, claimable fees, market activity, token metadata, and AI recommendations into a practical interface for deciding what to claim, what to promote, and what to watch next.
