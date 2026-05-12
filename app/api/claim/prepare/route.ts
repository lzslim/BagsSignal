import { NextResponse } from "next/server";
import { getClaimTransactions, getClaimablePositions } from "@/lib/bags-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const wallet = body.wallet as string | undefined;
  const mint = body.mint as string | undefined;

  if (!wallet || !mint) {
    return NextResponse.json({ error: "Missing wallet or mint" }, { status: 400 });
  }

  try {
    const positions = await getClaimablePositions(wallet);
    const position = positions.find((item) => item.baseMint === mint);
    const claimableLamports = Number(position?.totalClaimableLamportsUserShare ?? 0);

    if (!position || !Number.isFinite(claimableLamports) || claimableLamports <= 0) {
      return NextResponse.json(
        { error: "No claimable fees are available right now. If you just claimed, Bags may still be updating this token's fee state." },
        { status: 409 }
      );
    }

    const transactions = await getClaimTransactions(wallet, mint);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No claimable fees are available right now. If you just claimed, Bags may still be updating this token's fee state." },
        { status: 409 }
      );
    }

    return NextResponse.json({ transactions, count: transactions.length });
  } catch (error) {
    const message = normalizeClaimPrepareError(error);
    return NextResponse.json(
      { error: message },
      { status: isTransientClaimState(message) ? 409 : 500 }
    );
  }
}

function normalizeClaimPrepareError(error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to prepare claim";
  const lower = message.toLowerCase();

  if (
    lower.includes("no claimable") ||
    lower.includes("nothing to claim") ||
    lower.includes("already claimed") ||
    lower.includes("claimable") ||
    lower.includes("fees")
  ) {
    return "No claimable fees are available right now. If you just claimed, Bags may still be updating this token's fee state.";
  }

  return message;
}

function isTransientClaimState(message: string) {
  return message.toLowerCase().includes("no claimable fees");
}
