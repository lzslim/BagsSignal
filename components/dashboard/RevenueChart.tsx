"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/shared/Panel";

export function RevenueChart({ data }: { data: Array<{ date: string; amount: number }> }) {
  return (
    <Panel className="h-[340px]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-semibold tracking-[0.01em]">Revenue trend</div>
          <div className="text-sm text-muted">Recent claimable fee movement</div>
        </div>
        <div className="rounded-lg border border-line px-3 py-2 text-xs text-muted">7D</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="bagsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#02FF40" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#02FF40" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#8A8AA0", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8A8AA0", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111118",
              border: "1px solid #1E1E2E",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="amount" stroke="#02FF40" strokeWidth={2.5} fill="url(#bagsArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}
