import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/bags-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet query parameter" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getDashboard(wallet));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
