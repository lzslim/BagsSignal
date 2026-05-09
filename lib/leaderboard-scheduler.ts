import { hasLeaderboardSyncConfig, getLeaderboardSyncIntervalMs, syncLeaderboardNow } from "@/lib/leaderboard-sync";
import { getLeaderboardEntryCount, shouldAutoSyncLeaderboard } from "@/lib/leaderboard-store";

declare global {
  var __bagssignalLeaderboardSchedulerStarted: boolean | undefined;
  var __bagssignalLeaderboardSchedulerTimer: NodeJS.Timeout | undefined;
}

export function ensureLeaderboardScheduler() {
  if (global.__bagssignalLeaderboardSchedulerStarted) return;
  global.__bagssignalLeaderboardSchedulerStarted = true;

  if (!hasLeaderboardSyncConfig()) return;

  if (getLeaderboardEntryCount() === 0 && shouldAutoSyncLeaderboard()) {
    void syncLeaderboardNow().catch(() => {});
  }
  global.__bagssignalLeaderboardSchedulerTimer = setInterval(() => {
    if (!shouldAutoSyncLeaderboard()) return;
    void syncLeaderboardNow().catch(() => {});
  }, getLeaderboardSyncIntervalMs());
}
