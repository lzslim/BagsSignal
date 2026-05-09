"use client";

import useSWR from "swr";
import type { AIInsightsResponse, DashboardResponse } from "@/lib/types";

const poster = async ([url, body]: [string, unknown]) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Failed to load AI insights");
  return json as AIInsightsResponse;
};

export function useAIInsights(
  wallet: string | null | undefined,
  dashboard: DashboardResponse | undefined
) {
  return useSWR<AIInsightsResponse>(
    dashboard
      ? [
          "/api/ai/insights",
          {
            wallet,
            context: {
              ...dashboard.summary,
              tokens: dashboard.tokens
            }
          }
        ]
      : null,
    poster
  );
}
