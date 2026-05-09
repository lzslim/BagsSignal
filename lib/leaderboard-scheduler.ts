import { hasLeaderboardSyncConfig, getLeaderboardSyncIntervalMs, syncLeaderboardNow } from "@/lib/leaderboard-sync";
import { getLeaderboardEntryCount, shouldAutoSyncLeaderboard } from "@/lib/leaderboard-store";

declare global {
  var __bagsdashLeaderboardSchedulerStarted: boolean | undefined;
  var __bagsdashLeaderboardSchedulerTimer: NodeJS.Timeout | undefined;
}

export function ensureLeaderboardScheduler() {
  if (global.__bagsdashLeaderboardSchedulerStarted) return;
  global.__bagsdashLeaderboardSchedulerStarted = true;

  if (!hasLeaderboardSyncConfig()) return;

  if (getLeaderboardEntryCount() === 0 && shouldAutoSyncLeaderboard()) {
    void syncLeaderboardNow().catch(() => {});
  }
  global.__bagsdashLeaderboardSchedulerTimer = setInterval(() => {
    if (!shouldAutoSyncLeaderboard()) return;
    void syncLeaderboardNow().catch(() => {});
  }, getLeaderboardSyncIntervalMs());
}
