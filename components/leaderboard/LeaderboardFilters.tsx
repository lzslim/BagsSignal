"use client";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function LeaderboardFilters({
  search,
  onSearchChange
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="space-y-2 text-sm text-muted">
        <span className="block">Search tracked tokens</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by token or username..."
          className="h-11 w-60 rounded-lg border border-line bg-panel px-3 text-sm text-white placeholder:text-muted"
        />
      </label>
    </div>
  );
}
