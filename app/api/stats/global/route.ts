import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET() {
  return NextResponse.json({
    totalCreators: 1000,
    totalTokensTracked: 3200,
    totalFeesClaimedSOL: 0
  });
}
