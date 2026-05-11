import { NextResponse } from "next/server";
import { readSampleDashboardFromLeaderboard } from "@/lib/leaderboard-store";
import type { DashboardResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const sample = await readSampleDashboardFromLeaderboard(8, wallet);
  return NextResponse.json(sample ?? emptyDashboard());
}

function emptyDashboard(): DashboardResponse {
  return {
    demoMode: true,
    simulatedWallet: null,
    summary: {
      totalClaimableSOL: 0,
      totalLifetimeEarnedSOL: 0,
      totalLifetimeFeesSOL: 0,
      tokenCount: 0,
      collaboratorCount: 0
    },
    tokens: [],
    chart: []
  };
}
