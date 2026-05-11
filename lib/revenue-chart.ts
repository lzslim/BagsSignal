import type { ClaimEvent } from "@/lib/types";
import { safeDate } from "@/lib/utils";

export type RevenueChartPoint = {
  date: string;
  amount: number;
};

export function buildClaimEventChart(events: ClaimEvent[], days = 7): RevenueChartPoint[] {
  const dayCount = Math.min(Math.max(days, 1), 30);
  const today = startOfDay(new Date());
  const buckets = new Map<string, number>();

  for (let index = dayCount - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    buckets.set(formatChartDate(date), 0);
  }

  for (const event of events) {
    const date = safeDate(event.timestamp);
    const day = startOfDay(date);
    const label = formatChartDate(day);

    if (!buckets.has(label)) continue;

    buckets.set(label, (buckets.get(label) ?? 0) + event.amountSOL);
  }

  return Array.from(buckets.entries()).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(4))
  }));
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatChartDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit"
  });
}
