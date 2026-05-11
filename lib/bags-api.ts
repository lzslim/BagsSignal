import { Connection, PublicKey } from "@solana/web3.js";
import { BAGS_API_BASE_URL, DEFAULT_RPC_URL, SOLSCAN_BASE } from "@/lib/constants";
import { buildClaimEventChart } from "@/lib/revenue-chart";
import type { ClaimEvent, Creator, DashboardResponse, TokenDetail, TokenPosition } from "@/lib/types";
import { bpsToPct, lamportsToSol, safeDate, tokenLabel } from "@/lib/utils";

type BagsEnvelope<T> = {
  success: boolean;
  response?: T;
  error?: string;
};

type ClaimablePosition = {
  baseMint: string;
  isCustomFeeVault?: boolean;
  isMigrated?: boolean;
  totalClaimableLamportsUserShare?: number | string;
  userBps?: number;
};

type BagsCreator = {
  username?: string | null;
  pfp?: string | null;
  royaltyBps?: number;
  isCreator?: boolean;
  wallet: string;
  provider?: string | null;
  providerUsername?: string | null;
  isAdmin?: boolean;
  totalClaimed?: string;
};

type PublicTokenProfile = {
  imageUrl: string | null;
};

export type BagsLaunchFeedToken = {
  mint: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  status: string | null;
  twitter: string | null;
  website: string | null;
};

type BagsLaunchFeedItem = {
  name?: string | null;
  symbol?: string | null;
  image?: string | null;
  tokenMint?: string | null;
  status?: string | null;
  twitter?: string | null;
  website?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type BagsClaimEvent = {
  wallet: string;
  isCreator?: boolean;
  amount: string;
  signature: string;
  timestamp: string;
};

type ClaimTx = {
  tx?: string;
  transaction?: string;
  blockhash?: {
    blockhash: string;
    lastValidBlockHeight: number;
  };
};

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

let metadataConnection: Connection | null = null;

function getMetadataConnection() {
  if (!metadataConnection) {
    metadataConnection = new Connection(process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL, "confirmed");
  }

  return metadataConnection;
}

function hasApiKey() {
  return Boolean(process.env.BAGS_API_KEY);
}

async function bagsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!process.env.BAGS_API_KEY) {
    throw new Error("BAGS_API_KEY is not configured");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${BAGS_API_BASE_URL}${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.BAGS_API_KEY,
          ...(init?.headers ?? {})
        },
        cache: "no-store",
        signal: AbortSignal.timeout(Number(process.env.BAGS_API_TIMEOUT_MS ?? "20000"))
      });

      const payload = (await response.json()) as BagsEnvelope<T>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? `Bags API request failed: ${response.status}`);
      }

      return payload.response as T;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await delay(500 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Bags API request failed");
}

export async function getClaimablePositions(wallet: string) {
  const params = new URLSearchParams({ wallet });
  return bagsFetch<ClaimablePosition[]>(`/token-launch/claimable-positions?${params.toString()}`);
}

export async function getTokenLifetimeFees(tokenMint: string) {
  const params = new URLSearchParams({ tokenMint });
  const value = await bagsFetch<string>(`/token-launch/lifetime-fees?${params.toString()}`);
  return lamportsToSol(value);
}

export async function getTokenLaunchFeed(): Promise<BagsLaunchFeedToken[]> {
  const feed = await bagsFetch<BagsLaunchFeedItem[]>("/token-launch/feed");
  return feed
    .filter((item) => item.tokenMint)
    .map((item) => ({
      mint: item.tokenMint as string,
      symbol: item.symbol || "UNKNOWN",
      name: item.name || item.symbol || "Unnamed Token",
      imageUrl: item.image ? normalizeMetadataUri(item.image) : null,
      createdAt: item.createdAt ?? item.updatedAt ?? new Date().toISOString(),
      status: item.status ?? null,
      twitter: item.twitter ?? null,
      website: item.website ?? null
    }));
}

export async function getTokenCreators(tokenMint: string, wallet?: string) {
  const params = new URLSearchParams({ tokenMint });
  const creators = await bagsFetch<BagsCreator[]>(`/token-launch/creator/v3?${params.toString()}`);
  return creators.map((creator): Creator => ({
    wallet: creator.wallet,
    provider: creator.provider ?? null,
    providerUsername: creator.providerUsername ?? creator.username ?? null,
    username: creator.username ?? null,
    pfp: creator.pfp ?? null,
    royaltyBps: creator.royaltyBps ?? 0,
    royaltyPct: bpsToPct(creator.royaltyBps ?? 0),
    isCreator: Boolean(creator.isCreator),
    isAdmin: creator.isAdmin,
    isMe: wallet ? creator.wallet === wallet : false,
    totalClaimedSOL: creator.totalClaimed ? lamportsToSol(creator.totalClaimed) : undefined
  }));
}

export async function getClaimEvents(tokenMint: string, wallet?: string, limit = 20, offset = 0) {
  const params = new URLSearchParams({
    tokenMint,
    mode: "offset",
    limit: String(Math.min(Math.max(limit, 1), 100)),
    offset: String(Math.max(offset, 0))
  });
  const response = await bagsFetch<{ events: BagsClaimEvent[] }>(
    `/fee-share/token/claim-events?${params.toString()}`
  );

  return response.events
    .filter((event) => !wallet || event.wallet === wallet)
    .map((event): ClaimEvent => ({
      mint: tokenMint,
      wallet: event.wallet,
      amountSOL: lamportsToSol(event.amount),
      timestamp: safeDate(event.timestamp).toISOString(),
      txHash: event.signature,
      solscanUrl: `${SOLSCAN_BASE}/tx/${event.signature}`
    }));
}

export async function getClaimTransactions(feeClaimer: string, tokenMint: string) {
  const response = await bagsFetch<ClaimTx[]>("/token-launch/claim-txs/v3", {
    method: "POST",
    body: JSON.stringify({ feeClaimer, tokenMint })
  });

  return response
    .map((item) => ({
      tx: item.tx ?? item.transaction,
      blockhash: item.blockhash
    }))
    .filter((item) => Boolean(item.tx))
    .map((item) => ({
      tx: item.tx as string,
      blockhash: item.blockhash
    }));
}

export async function getTokenPublicProfile(tokenMint: string): Promise<PublicTokenProfile> {
  const chainProfile = await getTokenProfileFromChainMetadata(tokenMint);
  if (chainProfile.imageUrl) {
    return chainProfile;
  }

  try {
    const response = await fetch(`https://bags.fm/${tokenMint}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(Number(process.env.BAGS_API_TIMEOUT_MS ?? "20000"))
    });
    const html = await response.text();
    const ogMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const imageUrl = ogMatch?.[1] ?? null;
    return { imageUrl };
  } catch {
    return { imageUrl: null };
  }
}

async function getTokenProfileFromChainMetadata(tokenMint: string): Promise<PublicTokenProfile> {
  try {
    const mint = new PublicKey(tokenMint);
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    );
    const account = await getMetadataConnection().getAccountInfo(metadataPda, "confirmed");

    if (!account?.data) {
      return { imageUrl: null };
    }

    const uri = parseMetaplexMetadataUri(account.data);
    if (!uri) {
      return { imageUrl: null };
    }

    const jsonUrl = normalizeMetadataUri(uri);
    const response = await fetch(jsonUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(Number(process.env.TOKEN_METADATA_TIMEOUT_MS ?? "20000"))
    });
    const metadata = await response.json() as { image?: string; image_url?: string };
    const imageUrl = metadata.image ?? metadata.image_url ?? null;

    return { imageUrl: imageUrl ? normalizeMetadataUri(imageUrl) : null };
  } catch {
    return { imageUrl: null };
  }
}

function parseMetaplexMetadataUri(data: Buffer) {
  let offset = 1 + 32 + 32;
  const name = readRustString(data, offset);
  offset = name.nextOffset;
  const symbol = readRustString(data, offset);
  offset = symbol.nextOffset;
  const uri = readRustString(data, offset);

  return uri.value.trim();
}

function readRustString(data: Buffer, offset: number) {
  const length = data.readUInt32LE(offset);
  const start = offset + 4;
  const end = start + length;
  return {
    value: data.subarray(start, end).toString("utf8").replace(/\0/g, "").trim(),
    nextOffset: end
  };
}

function normalizeMetadataUri(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }

  if (uri.startsWith("ar://")) {
    return `https://arweave.net/${uri.replace("ar://", "")}`;
  }

  return uri;
}

export async function getDashboard(wallet: string): Promise<DashboardResponse> {
  if (!hasApiKey()) {
    throw new Error("BAGS_API_KEY is not configured");
  }

  const positions = await getClaimablePositions(wallet);
  const tokens = await Promise.all(
    positions.map(async (position, index): Promise<TokenPosition> => {
      const [lifetimeTotalSOL, creators] = await Promise.all([
        getTokenLifetimeFees(position.baseMint).catch(() => 0),
        getTokenCreators(position.baseMint, wallet).catch(() => [])
      ]);
      const me = creators.find((creator) => creator.isMe) ?? creators.find((creator) => creator.isCreator);
      const royaltyBps = position.userBps ?? me?.royaltyBps ?? 0;
      const labels = tokenLabel(position.baseMint, index);

      return {
        mint: position.baseMint,
        symbol: labels.symbol,
        name: labels.name,
        pfp: creators.find((creator) => creator.pfp)?.pfp ?? null,
        claimableSOL: lamportsToSol(position.totalClaimableLamportsUserShare),
        lifetimeTotalSOL,
        lifetimeEarnedSOL: lifetimeTotalSOL * (royaltyBps / 10000),
        royaltyBps,
        royaltyPct: bpsToPct(royaltyBps),
        isCustomFeeVault: Boolean(position.isCustomFeeVault),
        isMigrated: Boolean(position.isMigrated),
        collaborators: Math.max(creators.length - 1, 0),
        feeMode: position.isCustomFeeVault ? "Custom" : "Default"
      };
    })
  );

  const summary = {
    totalClaimableSOL: tokens.reduce((sum, token) => sum + token.claimableSOL, 0),
    totalLifetimeEarnedSOL: tokens.reduce((sum, token) => sum + token.lifetimeEarnedSOL, 0),
    totalLifetimeFeesSOL: tokens.reduce((sum, token) => sum + token.lifetimeTotalSOL, 0),
    tokenCount: tokens.length,
    collaboratorCount: tokens.reduce((sum, token) => sum + token.collaborators, 0)
  };
  const claimEvents = (await Promise.all(
    tokens.map((token) => getClaimEvents(token.mint, wallet, 100, 0).catch(() => []))
  )).flat();

  return {
    demoMode: false,
    summary,
    tokens,
    chart: buildClaimEventChart(claimEvents)
  };
}

export async function getTokenDetail(tokenMint: string, wallet?: string): Promise<TokenDetail> {
  if (!hasApiKey()) {
    throw new Error("BAGS_API_KEY is not configured");
  }

  const [lifetimeTotalSOL, creators, positions, claimHistory] = await Promise.all([
    getTokenLifetimeFees(tokenMint).catch(() => 0),
    getTokenCreators(tokenMint, wallet).catch(() => []),
    wallet ? getClaimablePositions(wallet).catch(() => []) : Promise.resolve([]),
    getClaimEvents(tokenMint, wallet, 20, 0).catch(() => [])
  ]);

  const position = positions.find((item) => item.baseMint === tokenMint);
  const me = creators.find((creator) => creator.isMe) ?? creators.find((creator) => creator.isCreator);
  const royaltyBps = position?.userBps ?? me?.royaltyBps ?? 0;
  const labels = tokenLabel(tokenMint);

  return {
    mint: tokenMint,
    symbol: labels.symbol,
    name: labels.name,
    pfp: creators.find((creator) => creator.pfp)?.pfp ?? null,
    claimableSOL: lamportsToSol(position?.totalClaimableLamportsUserShare),
    lifetimeTotalSOL,
    lifetimeEarnedSOL: lifetimeTotalSOL * (royaltyBps / 10000),
    royaltyBps,
    royaltyPct: bpsToPct(royaltyBps),
    isCustomFeeVault: Boolean(position?.isCustomFeeVault),
    isMigrated: Boolean(position?.isMigrated),
    collaborators: Math.max(creators.length - 1, 0),
    feeMode: position?.isCustomFeeVault ? "Custom" : "Default",
    creators,
    claimHistory
  };
}

export async function getHistory(wallet: string, mint?: string, page = 1, pageSize = 20) {
  if (!hasApiKey()) {
    return paginateEvents([], page, pageSize);
  }

  const tokenMints = mint ? [mint] : (await getClaimablePositions(wallet)).map((item) => item.baseMint);
  const events = (await Promise.all(
    tokenMints.map((tokenMint) => getClaimEvents(tokenMint, wallet, 100, 0).catch(() => []))
  )).flat();

  return paginateEvents(events, page, pageSize);
}

function paginateEvents(events: ClaimEvent[], page: number, pageSize: number) {
  const normalizedPage = Math.max(page, 1);
  const normalizedPageSize = Math.min(Math.max(pageSize, 1), 100);
  const sorted = events.sort((a, b) => safeDate(b.timestamp).getTime() - safeDate(a.timestamp).getTime());
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    events: sorted.slice(start, start + normalizedPageSize),
    pagination: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / normalizedPageSize))
    }
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
