"use client";

import useSWR from "swr";
import type { AIInsightsResponse, TokenDetail } from "@/lib/types";

const poster = async ([url, body]: [string, unknown]) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Failed to load token insights");
  return json as AIInsightsResponse;
};

export function useTokenInsights(wallet: string | null | undefined, token: TokenDetail | undefined) {
  return useSWR<AIInsightsResponse>(
    token ? ["/api/ai/token-insights", { wallet, token }] : null,
    poster
  );
}
