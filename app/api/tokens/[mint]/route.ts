import { NextResponse } from "next/server";
import { getTokenDetail } from "@/lib/bags-api";

export async function GET(
  request: Request,
  { params }: { params: { mint: string } }
) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet") ?? undefined;

  try {
    return NextResponse.json(await getTokenDetail(params.mint, wallet));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load token detail" },
      { status: 500 }
    );
  }
}
