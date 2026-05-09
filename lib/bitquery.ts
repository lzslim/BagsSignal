const BITQUERY_ENDPOINT = process.env.BITQUERY_GRAPHQL_URL?.trim() || "https://streaming.bitquery.io/graphql";
const BAGS_CREATOR_SIGNER = "BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv";
const METEORA_DBC_PROGRAM = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";

export type BitqueryTokenRow = {
  mint: string;
  symbol: string;
  name: string;
  createdAt: string;
  discoverySource?: string;
};

export type BitqueryTradeRow = {
  mint: string;
  volumeUsd: number;
  tradeCount: number;
  lastTradeAt: string | null;
};

export async function fetchBagsTokens(limit = 100): Promise<BitqueryTokenRow[]> {
  const results = await Promise.allSettled([
    fetchBagsSignedLaunches(limit),
    fetchBagsProgramLaunches(Math.max(limit * 4, 250)),
    fetchBagsActiveTradeTokens(Math.max(limit * 3, 150))
  ]);
  const [signedLaunches, programLaunches, activeTrades] = results.map((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  const tokens = dedupeByMint([...signedLaunches, ...activeTrades, ...programLaunches]).slice(0, limit);

  if (tokens.length === 0) {
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));
    throw new Error(errors.length ? `Bitquery discovery returned no tokens: ${errors.join("; ")}` : "Bitquery discovery returned no tokens");
  }

  return tokens;
}

export async function fetchBagsTradeMetrics(mints: string[], hours = 24): Promise<BitqueryTradeRow[]> {
  if (mints.length === 0) return [];

  const rows = await Promise.all(
    chunk(mints, 50).map((items) => fetchBagsTradeMetricChunk(items, hours).catch(() => []))
  );
  return rows.flat();
}

async function fetchBagsSignedLaunches(limit: number): Promise<BitqueryTokenRow[]> {
  const data = await bitqueryRequest<{
    Solana: {
      TokenSupplyUpdates: Array<{
        Block: { Time: string };
        TokenSupplyUpdate: {
          Currency: {
            Name: string | null;
            Symbol: string | null;
            MintAddress: string;
          };
        };
      }>;
    };
  }>({
    query: `
      query BagsTokenSupply($limit: Int!, $creator: String!, $program: String!) {
        Solana {
          TokenSupplyUpdates(
            limit: { count: $limit }
            orderBy: { descending: Block_Time }
            where: {
              Instruction: {
                Program: {
                  Address: { is: $program }
                  Method: { is: "initialize_virtual_pool_with_spl_token" }
                }
              }
              Transaction: { Signer: { is: $creator } }
              TokenSupplyUpdate: { Amount: { ne: "0" } }
            }
          ) {
            Block { Time }
            TokenSupplyUpdate {
              Currency {
                Name
                Symbol
                MintAddress
              }
            }
          }
        }
      }
    `,
    variables: {
      limit,
      creator: BAGS_CREATOR_SIGNER,
      program: METEORA_DBC_PROGRAM
    }
  });

  return dedupeByMint(
    data.Solana.TokenSupplyUpdates.map((row) => ({
      mint: row.TokenSupplyUpdate.Currency.MintAddress,
      symbol: row.TokenSupplyUpdate.Currency.Symbol || "UNKNOWN",
      name: row.TokenSupplyUpdate.Currency.Name || row.TokenSupplyUpdate.Currency.Symbol || "Unnamed Token",
      createdAt: row.Block.Time,
      discoverySource: "signed-launch"
    }))
  );
}

async function fetchBagsProgramLaunches(limit: number): Promise<BitqueryTokenRow[]> {
  const data = await bitqueryRequest<{
    Solana: {
      TokenSupplyUpdates: Array<{
        Block: { Time: string };
        TokenSupplyUpdate: {
          Currency: {
            Name: string | null;
            Symbol: string | null;
            MintAddress: string;
          };
        };
      }>;
    };
  }>({
    query: `
      query BagsProgramTokenSupply($limit: Int!, $program: String!) {
        Solana {
          TokenSupplyUpdates(
            limit: { count: $limit }
            orderBy: { descending: Block_Time }
            where: {
              Instruction: {
                Program: {
                  Address: { is: $program }
                  Method: { is: "initialize_virtual_pool_with_spl_token" }
                }
              }
              TokenSupplyUpdate: { Amount: { ne: "0" } }
            }
          ) {
            Block { Time }
            TokenSupplyUpdate {
              Currency {
                Name
                Symbol
                MintAddress
              }
            }
          }
        }
      }
    `,
    variables: {
      limit,
      program: METEORA_DBC_PROGRAM
    }
  });

  return dedupeByMint(
    data.Solana.TokenSupplyUpdates
      .map((row) => ({
        mint: row.TokenSupplyUpdate.Currency.MintAddress,
        symbol: row.TokenSupplyUpdate.Currency.Symbol || "UNKNOWN",
        name: row.TokenSupplyUpdate.Currency.Name || row.TokenSupplyUpdate.Currency.Symbol || "Unnamed Token",
        createdAt: row.Block.Time,
        discoverySource: "program-launch"
      }))
      .filter((row) => row.mint.endsWith("BAGS"))
  );
}

async function fetchBagsActiveTradeTokens(limit: number): Promise<BitqueryTokenRow[]> {
  const data = await bitqueryRequest<{
    Solana: {
      DEXTradeByTokens: Array<{
        Block: { Time: string };
        Trade: {
          Currency: { MintAddress: string; Symbol: string | null; Name: string | null };
        };
      }>;
    };
  }>({
    query: `
      query BagsActiveTradeTokens($limit: Int!) {
        Solana {
          DEXTradeByTokens(
            limit: { count: $limit }
            orderBy: { descendingByField: "volumeUsd" }
            where: {
              Trade: { Currency: { MintAddress: { endsWith: "BAGS" } } }
              Block: { Time: { since_relative: { days_ago: 7 } } }
            }
          ) {
            Block { Time }
            Trade {
              Currency { MintAddress Symbol Name }
            }
            volumeUsd: sum(of: Trade_Side_AmountInUSD)
          }
        }
      }
    `,
    variables: { limit }
  });

  return dedupeByMint(
    data.Solana.DEXTradeByTokens.map((row) => ({
      mint: row.Trade.Currency.MintAddress,
      symbol: row.Trade.Currency.Symbol || "UNKNOWN",
      name: row.Trade.Currency.Name || row.Trade.Currency.Symbol || "Unnamed Token",
      createdAt: row.Block.Time,
      discoverySource: "active-trade"
    }))
  );
}

async function fetchBagsTradeMetricChunk(mints: string[], hours: number): Promise<BitqueryTradeRow[]> {
  const data = await bitqueryRequest<{
    Solana: {
      DEXTradeByTokens: Array<{
        Trade: {
          Currency: { MintAddress: string };
        };
        volumeUsd: number | string | null;
        tradeCount: number | string | null;
      }>;
    };
  }>({
    query: `
      query BagsTradeMetrics($mints: [String!]!, $hoursAgo: Int!) {
        Solana {
          DEXTradeByTokens(
            orderBy: { descendingByField: "volumeUsd" }
            where: {
              Trade: {
                Currency: { MintAddress: { in: $mints } }
              }
              Block: { Time: { since_relative: { hours_ago: $hoursAgo } } }
            }
          ) {
            Trade {
              Currency { MintAddress }
            }
            volumeUsd: sum(of: Trade_Side_AmountInUSD)
            tradeCount: count
          }
        }
      }
    `,
    variables: { mints, hoursAgo: hours }
  });

  return data.Solana.DEXTradeByTokens.map((row) => ({
    mint: row.Trade.Currency.MintAddress,
    volumeUsd: Number(row.volumeUsd ?? 0),
    tradeCount: Number(row.tradeCount ?? 0),
    lastTradeAt: null
  }));
}

async function bitqueryRequest<T>({
  query,
  variables
}: {
  query: string;
  variables?: Record<string, unknown>;
}) {
  const token = process.env.BITQUERY_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("BITQUERY_ACCESS_TOKEN is not configured");
  }
  const normalizedToken = token.replace(/^Bearer\s+/i, "").trim();

  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (normalizedToken.startsWith("ory_") || normalizedToken.startsWith("ory_at_")) {
    headers.authorization = `Bearer ${normalizedToken}`;
  } else {
    headers["X-API-KEY"] = normalizedToken;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(BITQUERY_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
        signal: AbortSignal.timeout(Number(process.env.BITQUERY_TIMEOUT_MS ?? "30000"))
      });

      const text = await response.text();
      let json: { errors?: Array<{ message?: string }>; data?: T };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(text || `Bitquery request failed: ${response.status}`);
      }
      if (!response.ok || json.errors?.length) {
        throw new Error(json.errors?.[0]?.message ?? `Bitquery request failed: ${response.status}`);
      }

      return json.data as T;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await delay(500 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Bitquery request failed");
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dedupeByMint(rows: BitqueryTokenRow[]) {
  const seen = new Set<string>();
  const result: BitqueryTokenRow[] = [];

  for (const row of rows) {
    if (seen.has(row.mint)) continue;
    seen.add(row.mint);
    result.push(row);
  }

  return result;
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}
