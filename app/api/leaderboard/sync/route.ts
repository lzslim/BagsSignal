export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { syncLeaderboardNow } from "@/lib/leaderboard-sync";
import { readLeaderboardSyncMeta } from "@/lib/leaderboard-store";

export async function POST() {
  try {
    const result = await syncLeaderboardNow();
    return NextResponse.json({
      ok: true,
      result,
      latestRun: await readLeaderboardSyncMeta()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to sync leaderboard",
        latestRun: await readLeaderboardSyncMeta()
      },
      { status: 500 }
    );
  }
}
