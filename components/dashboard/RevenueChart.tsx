"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/shared/Panel";

export function RevenueChart({ data }: { data: Array<{ date: string; amount: number }> }) {
  return (
    <Panel className="h-[380px] overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="font-display text-xl font-semibold tracking-[0.01em] text-white">Revenue trend</div>
          <div className="mt-1 text-sm text-muted">Recent claimable fee movement</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted">7D</div>
      </div>
      <div className="h-[300px] px-2 pb-4 pt-5 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -10, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="bagsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#02FF40" stopOpacity={0.34} />
                <stop offset="72%" stopColor="#02FF40" stopOpacity={0.045} />
                <stop offset="100%" stopColor="#02FF40" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#8A8AA0", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: "#8A8AA0", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              cursor={{ stroke: "rgba(2,255,64,0.28)", strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: "#111118",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "#fff",
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
              }}
              labelStyle={{ color: "#FFFFFF" }}
            />
            <Area type="monotone" dataKey="amount" stroke="#02FF40" strokeWidth={2.75} fill="url(#bagsArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
