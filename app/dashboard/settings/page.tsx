"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/shared/Panel";
import { useRedirectOnDisconnect } from "@/hooks/useRedirectOnDisconnect";

export default function SettingsPage() {
  useRedirectOnDisconnect();

  return (
    <AppShell title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[0.01em]">Settings</h1>
          <p className="mt-2 text-sm text-muted">
            Environment notes for the hackathon build and production deployment.
          </p>
        </div>
        <Panel>
          <div className="space-y-4 text-sm text-muted">
            <p>
              Add `BAGS_API_KEY` to enable live Bags API data. Without it, the app runs in demo mode so the full user flow can still be reviewed during judging.
            </p>
            <p>
              Add `BITQUERY_ACCESS_TOKEN` to enable leaderboard sync. The sync stores aggregated leaderboard rows in Supabase and the leaderboard page reads from the cloud database.
            </p>
            <p>
              Set `NEXT_PUBLIC_SOLANA_RPC_URL` and `SOLANA_RPC_URL` to a stable mainnet RPC endpoint before production deployment.
            </p>
            <p>
              Wallet signing always happens in the browser. The server only prepares unsigned claim transactions and never touches private keys.
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
