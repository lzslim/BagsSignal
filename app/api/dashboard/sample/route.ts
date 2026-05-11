import { NextResponse } from "next/server";
import { mockDashboard } from "@/lib/mock";
import { readSampleDashboardFromLeaderboard } from "@/lib/leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const sample = await readSampleDashboardFromLeaderboard(8, wallet);
  return NextResponse.json(sample ?? mockDashboard);
}
