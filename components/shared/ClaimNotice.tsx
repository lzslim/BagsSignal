"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function ClaimNotice({
  type,
  message
}: {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}) {
  if (type === "idle" || !message) return null;

  const content = {
    loading: {
      icon: Loader2,
      className: "border-brand/45 bg-[#06170b] text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
      iconClassName: "text-brand",
      spin: true
    },
    success: {
      icon: CheckCircle2,
      className: "border-brand/45 bg-[#06170b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
      iconClassName: "text-brand",
      spin: false
    },
    error: {
      icon: AlertCircle,
      className: "border-red-400/45 bg-[#1b0b0e] text-red-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
      iconClassName: "text-red-300",
      spin: false
    }
  }[type];

  const Icon = content.icon;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm backdrop-blur-xl ${content.className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${content.iconClassName} ${content.spin ? "animate-spin" : ""}`} />
        <span className="leading-5">{message}</span>
      </div>
    </div>
  );
}
