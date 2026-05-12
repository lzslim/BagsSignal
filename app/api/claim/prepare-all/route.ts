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
    const message = normalizeClaimPrepareError(error);
    return NextResponse.json(
      { error: message },
      { status: isTransientClaimState(message) ? 409 : 500 }
    );
  }
}

function normalizeClaimPrepareError(error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to prepare all claims";
  const lower = message.toLowerCase();

  if (
    lower.includes("no claimable") ||
    lower.includes("nothing to claim") ||
    lower.includes("already claimed") ||
    lower.includes("claimable") ||
    lower.includes("fees")
  ) {
    return "No claimable fees are available right now. If you just claimed, Bags may still be updating fee state.";
  }

  return message;
}

function isTransientClaimState(message: string) {
  return message.toLowerCase().includes("no claimable fees");
}
