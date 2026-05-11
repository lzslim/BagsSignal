import { NextResponse } from "next/server";
import { readLeaderboardFromStore } from "@/lib/leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    return NextResponse.json(await readLeaderboardFromStore({
      sort: searchParams.get("sort") ?? "score",
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "20"),
      search: searchParams.get("search") ?? "",
      wallet: searchParams.get("wallet")
    }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
