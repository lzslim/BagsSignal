import { BarChart3, ExternalLink, FlaskConical, Rocket } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/shared/Panel";

export function EmptyCreatorState({ onSampleMode }: { onSampleMode: () => void }) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 text-brand">
            <Rocket className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-[0.01em] text-white">
            No creator revenue found for this wallet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            This wallet has not launched or collaborated on any Bags token yet. You can still explore live creator performance or open a sample dashboard built to show the full workflow.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSampleMode}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <FlaskConical className="h-4 w-4" />
              View sample creator
            </button>
            <Link
              href="/leaderboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              <BarChart3 className="h-4 w-4" />
              Explore leaderboard
            </Link>
            <a
              href="https://bags.fm"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              Launch on Bags
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-line bg-white/[0.025] p-7 lg:border-l lg:border-t-0">
          <div className="text-xs uppercase tracking-[0.18em] text-muted">What this means</div>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted">
            <div>
              <span className="font-medium text-white">Your wallet is connected.</span> Bags simply has no claimable creator position for it yet.
            </div>
            <div>
              <span className="font-medium text-white">The app is still live.</span> Leaderboard data and AI-ready token signals continue to use the local SQLite cache.
            </div>
            <div>
              <span className="font-medium text-white">Sample mode is explicit.</span> It helps reviewers understand the claim, token, revenue, and advisor experience without pretending it belongs to the connected wallet.
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
