"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { InsightCard } from "@/components/ai/InsightCard";
import { Panel } from "@/components/shared/Panel";
import type { InsightCard as InsightCardType } from "@/lib/types";

const advisorPlaybook: InsightCardType[][] = [
  [
    {
      id: "claim_baseline",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim available fees once the balance is meaningful enough to create a clean revenue baseline. That makes the next growth cycle easier to measure.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "top_token_focus",
      icon: "Target",
      title: "Top Token Focus",
      body: "Put your next creator update behind the token already producing the strongest revenue. Momentum compounds faster when attention is concentrated.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "growth_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "If trading is active but claimable fees are still small, treat the token as an early growth candidate instead of a mature income stream.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "weekly_claim_cadence",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "A weekly claim cadence is a practical default. It keeps treasury reporting simple without making every small fee movement feel urgent.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "revenue_concentration",
      icon: "Target",
      title: "Top Token Focus",
      body: "If one token is driving most of the wallet revenue, use that token as the flagship and let weaker tokens support the main narrative.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "activity_check",
      icon: "Gauge",
      title: "Growth Signal",
      body: "Revenue without recent activity can fade quickly. Pair fee tracking with trade velocity before deciding where to spend promotion effort.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_push",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Wait until after the next creator push before claiming if the current balance is small. The combined result will give a clearer read on campaign impact.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "community_anchor",
      icon: "Target",
      title: "Top Token Focus",
      body: "Choose the token with the clearest social identity as the campaign anchor. Revenue grows more reliably when holders understand the story.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "low_noise_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "Small but steady activity is worth watching. It can signal committed holders even before large volume appears.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_cleanup",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claiming now is useful when you want to separate historical revenue from the next experiment. Clean accounting makes creator decisions easier.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "focus_over_spread",
      icon: "Target",
      title: "Top Token Focus",
      body: "Avoid spreading attention across every token equally. Pick the one with the best blend of revenue and market activity, then build around it.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "risk_watch",
      icon: "Gauge",
      title: "Growth Signal",
      body: "If revenue exists but recent trading is thin, treat the token as a retention project. The next step is reactivation, not aggressive expansion.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_threshold",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Set a minimum claim threshold and stick to it. This prevents operational noise while still keeping creator revenue visible.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "winner_compounding",
      icon: "Target",
      title: "Top Token Focus",
      body: "The strongest token should get the next public update first. Leaderboards reward compounding signals more than scattered one-off posts.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "momentum_window",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "When volume and trades rise together, move quickly. Momentum windows are short, and creator distribution matters most while attention is fresh.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_hold",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "If claimable fees are tiny, holding off is reasonable. The more important task is understanding which token can produce the next meaningful fee event.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "token_quality",
      icon: "Target",
      title: "Top Token Focus",
      body: "Prioritize tokens with complete metadata and a recognizable creator account. Trust signals make revenue easier to grow.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "data_depth",
      icon: "Gauge",
      title: "Growth Signal",
      body: "A weak signal is not a rejection. It means the token needs more market data before the advisor should recommend a strong action.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_before_reporting",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim before reporting revenue to partners or collaborators. It gives everyone a shared number and reduces confusion around pending fees.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "partner_focus",
      icon: "Target",
      title: "Top Token Focus",
      body: "If a token has collaborators, align the next push around one message. Split attention works better when the campaign goal is shared.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "promotion_readiness",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "A token with revenue, active trades, and clean metadata is promotion-ready. That combination gives both users and AI enough context to trust the signal.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_spike",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "After a trading spike, claim once activity cools slightly. That captures the event without interrupting the momentum read.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "spike_followup",
      icon: "Target",
      title: "Top Token Focus",
      body: "Follow up on the token that just spiked. Fresh holders are more likely to engage when the creator acknowledges the moment quickly.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "cooldown_risk",
      icon: "Gauge",
      title: "Growth Signal",
      body: "A spike without continued trades can turn into a cooldown. Watch whether the next 24 hours confirm demand or just one burst of attention.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_for_treasury",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Use claims as a treasury rhythm, not just a button press. Regular claiming turns fee revenue into an operating signal for the creator.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "portfolio_trim",
      icon: "Target",
      title: "Top Token Focus",
      body: "If several tokens are inactive, stop treating them equally. Spend time on the one with the clearest revenue path and let the rest stay passive.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "holder_proxy",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "Trade count can be a useful holder proxy. More unique activity usually matters more than a single large volume print.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_validation",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim after you validate which token is creating revenue. The goal is not just collecting fees, but learning what caused them.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "narrative_focus",
      icon: "Target",
      title: "Top Token Focus",
      body: "The next creator move should sharpen the token narrative. Clear positioning makes future revenue easier to attribute.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "balanced_signal",
      icon: "Gauge",
      title: "Growth Signal",
      body: "The healthiest setup is balanced: some claimable revenue, visible trading, and a token people can recognize. Optimize for that mix.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_before_push",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim before a major announcement if you want the next fee movement to reflect that campaign cleanly. It turns promotion into a measurable experiment.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "strongest_identity",
      icon: "Target",
      title: "Top Token Focus",
      body: "Focus on the token with the strongest identity, not only the largest balance. A clear theme gives holders a reason to return.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "early_liquidity",
      icon: "Gauge",
      title: "Growth Signal",
      body: "Early liquidity is useful, but it needs repeated trades to become conviction. Watch whether activity repeats before increasing promotion.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_on_milestone",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Tie claims to milestones such as weekly reviews, launch anniversaries, or campaign closes. That makes revenue feel intentional instead of reactive.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "one_message",
      icon: "Target",
      title: "Top Token Focus",
      body: "Give your leading token one simple message for the next update. Tokens with clear positioning are easier for communities to repeat.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "repeat_trade_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "Repeated smaller trades can be healthier than one large print. The advisor should favor durable participation over isolated volume.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_when_clear",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim when the next action is clear. If you do not know what you will learn from the claim, wait until the revenue signal has more context.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "best_risk_reward",
      icon: "Target",
      title: "Top Token Focus",
      body: "Pick the token with the best risk-reward profile: enough activity to matter, but still early enough for creator attention to move the outcome.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "slow_build",
      icon: "Gauge",
      title: "Growth Signal",
      body: "A slow build can still be attractive when revenue and trading both trend upward. Do not ignore tokens just because they lack a dramatic spike.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_settlement",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "After heavy trading, let the market settle before claiming. A short delay can separate durable fee generation from temporary noise.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "creator_account_check",
      icon: "Target",
      title: "Top Token Focus",
      body: "Prioritize tokens where the creator account is visible and credible. Social context helps convert market activity into repeat attention.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "noise_filter",
      icon: "Gauge",
      title: "Growth Signal",
      body: "Treat isolated volume with caution. The stronger signal is volume supported by trade count, metadata quality, and continued creator activity.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_to_compare",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim before testing a new content angle. The next claim then becomes a simple comparison against the previous baseline.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "content_angle",
      icon: "Target",
      title: "Top Token Focus",
      body: "Use the top token to test one content angle at a time. Changing the message too often makes revenue attribution harder.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "attribution_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "The best growth signal is not just higher revenue. It is revenue that appears after a clear creator action and continues afterward.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_if_ready",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claim when the balance is ready to become useful capital. If the amount is not operationally meaningful, tracking may be more valuable than collecting.",
      priority: "low",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "operational_focus",
      icon: "Target",
      title: "Top Token Focus",
      body: "Choose the token that can support a practical next action: a post, a partner update, a holder reward, or a community prompt.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "fee_velocity",
      icon: "Gauge",
      title: "Growth Signal",
      body: "Fee velocity matters more than a static lifetime number. A token with smaller lifetime revenue but rising activity may deserve attention first.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_review",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Review token performance before claiming. The claim should close a decision loop, not replace the decision itself.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "revive_candidate",
      icon: "Target",
      title: "Top Token Focus",
      body: "A token with past revenue but weak recent activity is a revival candidate. Give it a focused update before writing it off.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "revival_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "Revival starts with small confirmation: a few new trades, fresh social attention, or a visible holder response after the creator acts.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_for_focus",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Claiming can be a focus tool. Once fees are collected, it becomes easier to judge which token deserves the next week of attention.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "avoid_vanity",
      icon: "Target",
      title: "Top Token Focus",
      body: "Avoid choosing a token only because it looks popular. Favor the one where creator effort can realistically improve revenue.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "actionable_momentum",
      icon: "Gauge",
      title: "Growth Signal",
      body: "Momentum is only useful if it suggests an action. If the signal does not change what you would do next, keep it as a watch item.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_after_partner_sync",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "If collaborators are involved, claim after everyone agrees on the next reporting window. Shared timing reduces fee split confusion.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "collab_token",
      icon: "Target",
      title: "Top Token Focus",
      body: "Collaborator tokens need a single owner for the next push. Assign one clear campaign lead before spending attention.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "collab_signal",
      icon: "TrendingUp",
      title: "Growth Signal",
      body: "A coordinated creator push should show up in both trades and claimable fees. If only one moves, inspect the campaign message.",
      priority: "medium",
      actionLabel: null,
      actionRoute: null
    }
  ],
  [
    {
      id: "claim_to_reset",
      icon: "Sparkles",
      title: "Claim Timing",
      body: "Use a claim to reset the scoreboard before a major experiment. A clean starting point makes the next result easier to defend.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "experiment_token",
      icon: "Target",
      title: "Top Token Focus",
      body: "Run experiments on the token with enough activity to produce feedback. Very quiet tokens may not give a useful read.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    },
    {
      id: "feedback_loop",
      icon: "Gauge",
      title: "Growth Signal",
      body: "The strongest setup is a feedback loop: creator action, market response, fee movement, then a sharper follow-up action.",
      priority: "high",
      actionLabel: null,
      actionRoute: null
    }
  ]
];

function pickNextScenario(current: number) {
  if (advisorPlaybook.length <= 1) return 0;
  let next = Math.floor(Math.random() * advisorPlaybook.length);
  if (next === current) next = (next + 1) % advisorPlaybook.length;
  return next;
}

function revealInsights(insights: InsightCardType[], progress: number) {
  let remaining = progress;
  return insights.flatMap((insight) => {
    if (remaining <= 0) return [];

    const body = insight.body.slice(0, remaining);
    remaining -= insight.body.length;
    return [{ ...insight, body }];
  });
}

export function AIAdvisorCard() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [streamProgress, setStreamProgress] = useState(Number.POSITIVE_INFINITY);
  const activeInsights = advisorPlaybook[scenarioIndex];
  const totalCharacters = useMemo(
    () => activeInsights.reduce((sum, insight) => sum + insight.body.length, 0),
    [activeInsights]
  );
  const isStreaming = streamProgress < totalCharacters;
  const visibleInsights = isStreaming ? revealInsights(activeInsights, streamProgress) : activeInsights;

  useEffect(() => {
    if (!isStreaming) return undefined;

    const timer = window.setInterval(() => {
      setStreamProgress((current) => Math.min(totalCharacters, current + 8));
    }, 24);

    return () => window.clearInterval(timer);
  }, [isStreaming, totalCharacters]);

  function handleRefresh() {
    const next = pickNextScenario(scenarioIndex);
    setScenarioIndex(next);
    setStreamProgress(0);
  }

  return (
    <Panel className="h-fit overflow-hidden p-0 2xl:sticky 2xl:top-24">
      <div className="border-b border-white/10 bg-white/[0.025] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display flex items-center gap-2 text-xl font-semibold tracking-[0.01em] text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand/25 bg-brand/10">
                <Sparkles className="h-4 w-4 text-brand" />
              </span>
              AI Revenue Advisor
            </div>
            <div className="mt-2 text-sm leading-6 text-muted">
              Wallet-level actions based on creator revenue, claimable fees, and token momentum.
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-muted transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStreaming ? "animate-spin text-brand" : ""}`} />
            {isStreaming ? "Thinking" : "Refresh"}
          </button>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {visibleInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </div>
    </Panel>
  );
}
