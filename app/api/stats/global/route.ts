import { NextResponse } from "next/server";
import { mockDashboard } from "@/lib/mock";

export const revalidate = 600;

export async function GET() {
  return NextResponse.json({
    totalCreators: 1000,
    totalTokensTracked: 3200,
    totalFeesClaimedSOL: Math.round(mockDashboard.summary.totalLifetimeFeesSOL * 64)
  });
}
