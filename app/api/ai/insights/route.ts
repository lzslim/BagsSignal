import { NextResponse } from "next/server";
import { generateDashboardInsights } from "@/lib/ai-provider";
import type { DashboardResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const wallet = body.wallet as string | undefined;
  const context = body.context as DashboardResponse["summary"] & { tokens: DashboardResponse["tokens"] } | undefined;

  if (!context) {
    return NextResponse.json({ error: "context is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await generateDashboardInsights({
        wallet,
        totalClaimableSOL: context.totalClaimableSOL,
        totalLifetimeEarnedSOL: context.totalLifetimeEarnedSOL,
        tokenCount: context.tokenCount,
        tokens: context.tokens
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI service unavailable" },
      { status: 502 }
    );
  }
}
