import { NextResponse } from "next/server";
import { getClaimTransactions } from "@/lib/bags-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const wallet = body.wallet as string | undefined;
  const mint = body.mint as string | undefined;

  if (!wallet || !mint) {
    return NextResponse.json({ error: "Missing wallet or mint" }, { status: 400 });
  }

  try {
    const transactions = await getClaimTransactions(wallet, mint);

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No claimable fees found" }, { status: 404 });
    }

    return NextResponse.json({ transactions, count: transactions.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare claim" },
      { status: 500 }
    );
  }
}
