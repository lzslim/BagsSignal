import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-line bg-panel text-muted">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 p-5 text-sm text-red-100">
      {message}
    </div>
  );
}
