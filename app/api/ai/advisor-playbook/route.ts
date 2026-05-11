import { NextResponse } from "next/server";
import type { InsightCard } from "@/lib/types";
import { hasSupabaseConfig, supabaseSelect } from "@/lib/supabase-rest";

type AdvisorPlaybookRow = {
  scenario_index: number;
  cards_json: InsightCard[];
  active: boolean;
};

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ scenarios: [] });
  }

  try {
    const rows = await supabaseSelect<AdvisorPlaybookRow>(
      "dashboard_advisor_playbooks",
      "select=scenario_index,cards_json,active&active=eq.true&order=scenario_index.asc"
    );

    return NextResponse.json({
      scenarios: rows.map((row) => row.cards_json).filter((cards) => Array.isArray(cards) && cards.length > 0)
    });
  } catch {
    return NextResponse.json({ scenarios: [] });
  }
}
