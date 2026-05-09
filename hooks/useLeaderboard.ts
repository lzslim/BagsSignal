"use client";

import useSWR from "swr";
import type { LeaderboardResponse } from "@/lib/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Failed to load leaderboard");
  return json as LeaderboardResponse;
};

export function useLeaderboard(params: {
  sort: string;
  period: string;
  page: number;
  pageSize: number;
  search: string;
  wallet?: string | null;
}) {
  const query = new URLSearchParams({
    sort: params.sort,
    period: params.period,
    page: String(params.page),
    pageSize: String(params.pageSize),
    search: params.search
  });

  if (params.wallet) query.set("wallet", params.wallet);

  return useSWR<LeaderboardResponse>(`/api/leaderboard?${query.toString()}`, fetcher);
}
