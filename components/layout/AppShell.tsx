"use client";

import { BarChart3, Clock3, Github, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { ClientWalletButton } from "@/components/wallet/ClientWalletButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/history", label: "History", icon: Clock3 }
];

export function AppShell({ children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTitle = pathname.startsWith("/leaderboard")
    ? "Leaderboard"
    : pathname.startsWith("/dashboard/history")
      ? "History"
      : "Dashboard";

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-line bg-panel/92 backdrop-blur-md">
        <div className="relative flex h-full items-center justify-between px-4 lg:px-6">
          <Logo />
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
            <div className="rounded-full border border-line bg-background/45 px-4 py-2 font-display text-sm font-semibold tracking-[0.01em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              {activeTitle}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-muted sm:flex">
              <span className="h-2 w-2 rounded-full bg-brand shadow-glow" />
              Mainnet
            </div>
            <ClientWalletButton />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-60 border-r border-line bg-panel lg:block">
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm text-muted transition",
                  active && "border-brand/20 bg-brand/10 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 flex justify-center border-t border-line pt-4">
          <a
            href="https://github.com/lzslim/BagsSignal"
            target="_blank"
            rel="noreferrer"
            aria-label="BagsSignal GitHub"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </aside>

      <main className="px-4 pb-10 pt-24 lg:ml-60 lg:px-8">{children}</main>
    </div>
  );
}
