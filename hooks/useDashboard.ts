"use client";

import useSWR from "swr";
import type { DashboardResponse } from "@/lib/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json as DashboardResponse;
};

export function useDashboard(wallet?: string | null) {
  return useSWR<DashboardResponse>(wallet ? `/api/dashboard?wallet=${wallet}` : null, fetcher);
}

export function useSampleDashboard(enabled: boolean, wallet?: string | null) {
  const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
  return useSWR<DashboardResponse>(enabled ? `/api/dashboard/sample${query}` : null, fetcher);
}
