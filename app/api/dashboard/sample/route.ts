import { NextResponse } from "next/server";
import { mockDashboard } from "@/lib/mock";
import { readSampleDashboardFromLeaderboard } from "@/lib/leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const sample = readSampleDashboardFromLeaderboard(8);
  return NextResponse.json(sample ?? mockDashboard);
}
