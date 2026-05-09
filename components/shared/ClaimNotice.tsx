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
    loading: { icon: Loader2, className: "border-brand/30 bg-brand/10 text-brand", spin: true },
    success: { icon: CheckCircle2, className: "border-brand/30 bg-brand/10 text-white", spin: false },
    error: { icon: AlertCircle, className: "border-danger/30 bg-danger/10 text-red-100", spin: false }
  }[type];

  const Icon = content.icon;

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${content.className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${content.spin ? "animate-spin" : ""}`} />
        <span>{message}</span>
      </div>
    </div>
  );
}
