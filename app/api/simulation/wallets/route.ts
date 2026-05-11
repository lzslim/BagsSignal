import { NextResponse } from "next/server";
import { readSimulationWalletsFromLeaderboard } from "@/lib/leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      wallets: await readSimulationWalletsFromLeaderboard(8)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load simulation wallets" },
      { status: 500 }
    );
  }
}
