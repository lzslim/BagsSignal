import { NextResponse } from "next/server";
import { readSampleClaimHistoryFromLeaderboard } from "@/lib/leaderboard-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const wallet = searchParams.get("wallet");
  const sample = await readSampleClaimHistoryFromLeaderboard(page, pageSize, wallet);

  if (!sample) {
    return NextResponse.json(
      { error: "No leaderboard cache is available for sample claim history yet." },
      { status: 404 }
    );
  }

  return NextResponse.json(sample);
}
