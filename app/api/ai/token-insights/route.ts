import { NextResponse } from "next/server";
import { generateTokenInsights } from "@/lib/ai-provider";
import type { TokenDetail } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = body.token as TokenDetail | undefined;

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await generateTokenInsights(token));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI service unavailable" },
      { status: 502 }
    );
  }
}
