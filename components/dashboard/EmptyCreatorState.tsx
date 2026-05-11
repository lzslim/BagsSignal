import { BarChart3, CircleAlert, ExternalLink, FlaskConical } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/shared/Panel";
import { SimulationWalletPicker } from "@/components/dashboard/SimulationWalletPicker";

export function EmptyCreatorState({
  onSampleMode,
  onSimulateWallet,
  title = "No Bags activity found for this wallet",
  description = "This wallet does not have Bags creator revenue or claim history yet. Use sample mode for a quick walkthrough, or simulate a ranked creator wallet to preview dashboard data from an active Bags creator without tying it to the connected wallet."
}: {
  onSampleMode: () => void;
  onSimulateWallet?: (wallet: string) => void;
  title?: string;
  description?: string;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="px-6 py-10 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 text-brand">
            <CircleAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-[0.01em] text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onSampleMode}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <FlaskConical className="h-4 w-4" />
              View sample mode
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
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-white transition hover:border-brand/40 hover:bg-brand/10"
            >
              Launch on Bags
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {onSimulateWallet ? <SimulationWalletPicker onSelect={onSimulateWallet} /> : null}
        </div>
      </div>
    </Panel>
  );
}
