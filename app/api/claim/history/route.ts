import { NextResponse } from "next/server";
import { getHistory } from "@/lib/bags-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const mint = searchParams.get("mint") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet query parameter" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getHistory(wallet, mint, page, pageSize));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load claim history" },
      { status: 500 }
    );
  }
}
