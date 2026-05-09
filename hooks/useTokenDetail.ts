"use client";

import useSWR from "swr";
import type { TokenDetail } from "@/lib/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json as TokenDetail;
};

export function useTokenDetail(mint?: string, wallet?: string | null) {
  const search = wallet ? `?wallet=${wallet}` : "";
  return useSWR<TokenDetail>(mint ? `/api/tokens/${mint}${search}` : null, fetcher);
}
