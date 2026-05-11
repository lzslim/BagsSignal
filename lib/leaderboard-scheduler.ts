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

  void Promise.all([getLeaderboardEntryCount(), shouldAutoSyncLeaderboard()])
    .then(([count, shouldSync]) => {
      if (count === 0 && shouldSync) void syncLeaderboardNow().catch(() => {});
    })
    .catch(() => {});
  global.__bagssignalLeaderboardSchedulerTimer = setInterval(() => {
    void shouldAutoSyncLeaderboard()
      .then((shouldSync) => {
        if (shouldSync) void syncLeaderboardNow().catch(() => {});
      })
      .catch(() => {});
  }, getLeaderboardSyncIntervalMs());
}
