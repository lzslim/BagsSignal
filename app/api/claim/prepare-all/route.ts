import { NextResponse } from "next/server";
import { getClaimTransactions, getClaimablePositions } from "@/lib/bags-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const wallet = body.wallet as string | undefined;

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const positions = await getClaimablePositions(wallet);
    const claimable = positions.filter((position) => Number(position.totalClaimableLamportsUserShare ?? 0) > 0);
    const tokens = (await Promise.all(
      claimable.map(async (position) => ({
        mint: position.baseMint,
        transactions: await getClaimTransactions(wallet, position.baseMint)
      }))
    )).filter((item) => item.transactions.length > 0);

    if (tokens.length === 0) {
      return NextResponse.json({ error: "No claimable fees found" }, { status: 404 });
    }

    return NextResponse.json({ tokens, totalTokens: tokens.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare all claims" },
      { status: 500 }
    );
  }
}
