export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { hasLeaderboardSyncConfig } from "@/lib/leaderboard-sync";
import { readLeaderboardSyncMeta } from "@/lib/leaderboard-store";

export async function GET() {
  return NextResponse.json({
    configured: hasLeaderboardSyncConfig(),
    latestRun: readLeaderboardSyncMeta()
  });
}
