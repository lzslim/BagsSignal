import { ArrowLeft, Eye } from "lucide-react";

export function SampleModeBanner({
  label,
  sampleWallet,
  onBack
}: {
  label: "creator revenue" | "claim history";
  sampleWallet?: string | null;
  onBack: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-warning/35 bg-[#1d1408] px-4 py-4 text-orange-50 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:px-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warning/70 to-transparent" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-warning/35 bg-warning/15 text-warning">
            <Eye className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
              Sample mode active
            </div>
            <p className="mt-1 text-sm leading-6 text-orange-100">
              You are previewing realistic {label} data, not data owned by the connected wallet.
              {sampleWallet ? (
                <span className="ml-1 whitespace-nowrap font-mono text-orange-50">
                  {sampleWallet.slice(0, 6)}...{sampleWallet.slice(-4)}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-brand/45 bg-brand px-5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(2,255,64,0.18)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-[#1d1408]"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to my wallet data
        </button>
      </div>
    </div>
  );
}
