import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatAddress(value?: string | null, head = 4, tail = 4) {
  if (!value) return "Unknown";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function formatSOL(value: number, digits = 3) {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value > 0 && value < 1 ? 3 : 0
  })} SOL`;
}

export function bpsToPct(bps?: number | null) {
  return (bps ?? 0) / 100;
}

export function lamportsToSol(value: string | number | bigint | null | undefined) {
  if (value == null) return 0;
  const asNumber = typeof value === "bigint" ? Number(value) : Number(value);
  if (!Number.isFinite(asNumber)) return 0;
  return asNumber / 1_000_000_000;
}

export function tokenLabel(mint: string, index = 0) {
  const suffix = mint.slice(-4).toUpperCase();
  return {
    symbol: index === 0 ? "BAGS" : `BAG${index + 1}`,
    name: index === 0 ? "Bags Creator Token" : `Creator Token ${suffix}`
  };
}

export function safeDate(input: string | number | Date) {
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function creatorProviderLabel(provider?: string | null) {
  if (!provider) return null;
  const normalized = provider.toLowerCase();
  if (normalized === "twitter" || normalized === "x") return "X";
  if (normalized === "github") return "GitHub";
  if (normalized === "apple") return "Apple";
  if (normalized === "telegram") return "Telegram";
  if (normalized === "discord") return "Discord";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function creatorProviderIconPath(provider?: string | null) {
  if (!provider) return null;
  const normalized = provider.toLowerCase();
  if (normalized === "twitter" || normalized === "x") return "/icons/x.svg";
  if (normalized === "github") return "/icons/github.svg";
  if (normalized === "apple") return "/icons/apple.svg";
  if (normalized === "telegram") return "/icons/telegram.svg";
  if (normalized === "discord") return "/icons/discord.svg";
  return null;
}

export function creatorProviderUrl(provider?: string | null, handle?: string | null) {
  if (!provider || !handle) return null;
  const normalized = provider.toLowerCase();
  const cleanHandle = handle.replace(/^@/, "");
  if (normalized === "twitter" || normalized === "x") return `https://x.com/${cleanHandle}`;
  if (normalized === "github") return `https://github.com/${cleanHandle}`;
  if (normalized === "apple") return null;
  if (normalized === "telegram") return `https://t.me/${cleanHandle}`;
  if (normalized === "discord") return `https://discord.com/users/${cleanHandle}`;
  return null;
}

export function isKnownCreatorProvider(provider?: string | null) {
  if (!provider) return false;
  const normalized = provider.toLowerCase();
  return normalized !== "unknown";
}

export function tokenFallbackDataUrl(seed: string, label: string) {
  const safeLabel = label.slice(0, 2).toUpperCase();
  const hue = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue}, 78%, 54%)"/>
          <stop offset="100%" stop-color="hsl(${(hue + 60) % 360}, 78%, 42%)"/>
        </linearGradient>
      </defs>
      <rect rx="18" width="80" height="80" fill="url(#g)"/>
      <text x="40" y="46" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="700">${safeLabel}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
