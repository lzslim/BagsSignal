import { NextResponse } from "next/server";
import { ensureLeaderboardScheduler } from "@/lib/leaderboard-scheduler";
import { readLeaderboardFromStore } from "@/lib/leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureLeaderboardScheduler();
  try {
    const payload = readLeaderboardFromStore({ page: 1, pageSize: 50 });
    return NextResponse.json(payload.stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load leaderboard stats" },
      { status: 500 }
    );
  }
}
