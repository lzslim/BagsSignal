import { Gauge, Sparkles, Target, TrendingUp } from "lucide-react";
import { mockAIInsights, mockTokenAIInsights } from "@/lib/mock";
import { buildInsightUserPrompt, buildTokenInsightPrompt, INSIGHT_SYSTEM_PROMPT, TOKEN_INSIGHT_SYSTEM_PROMPT } from "@/lib/ai-prompts";
import type { AIInsightsResponse, InsightCard, TokenDetail, TokenPosition } from "@/lib/types";

type AIProvider = "anthropic" | "openai" | "openai-compatible";

function getProvider(): AIProvider {
  const configured = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();
  if (configured === "openai") return "openai";
  if (configured === "openai-compatible") return "openai-compatible";
  return "anthropic";
}

export async function generateDashboardInsights(context: {
  totalClaimableSOL: number;
  totalLifetimeEarnedSOL: number;
  tokenCount: number;
  tokens: TokenPosition[];
  wallet?: string | null;
}): Promise<AIInsightsResponse> {
  if (!hasConfiguredProviderKey()) {
    return mockAIInsights;
  }

  const insights = await requestInsights({
    system: INSIGHT_SYSTEM_PROMPT,
    prompt: buildInsightUserPrompt(context),
    maxTokens: 900
  });

  return {
    provider: getProvider(),
    generatedAt: Date.now(),
    insights
  };
}

export async function generateTokenInsights(token: TokenDetail): Promise<AIInsightsResponse> {
  if (!hasConfiguredProviderKey()) {
    return mockTokenAIInsights(token.mint);
  }

  const insights = await requestInsights({
    system: TOKEN_INSIGHT_SYSTEM_PROMPT,
    prompt: buildTokenInsightPrompt(token),
    maxTokens: 600
  });

  return {
    provider: getProvider(),
    generatedAt: Date.now(),
    insights: insights.slice(0, 2)
  };
}

function hasConfiguredProviderKey() {
  const provider = getProvider();
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  return Boolean(process.env.OPENAI_API_KEY);
}

async function requestInsights({
  system,
  prompt,
  maxTokens
}: {
  system: string;
  prompt: string;
  maxTokens: number;
}) {
  const provider = getProvider();
  let rawText = "";

  if (provider === "anthropic") {
    rawText = await requestAnthropic(system, prompt, maxTokens);
  } else {
    rawText = await requestOpenAICompatible(system, prompt, maxTokens, provider);
  }

  return normalizeInsights(rawText);
}

async function requestAnthropic(system: string, prompt: string, maxTokens: number) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

async function requestOpenAICompatible(
  system: string,
  prompt: string,
  maxTokens: number,
  provider: Exclude<AIProvider, "anthropic">
) {
  const baseUrl =
    provider === "openai"
      ? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
      : process.env.OPENAI_COMPATIBLE_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  const model =
    provider === "openai"
      ? process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
      : process.env.OPENAI_COMPATIBLE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${system}\nWrap the array in a top-level object as { "insights": [...] }.` },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function normalizeInsights(rawText: string): InsightCard[] {
  const clean = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  const array = Array.isArray(parsed) ? parsed : parsed.insights;

  if (!Array.isArray(array)) {
    throw new Error("AI response is not a valid insight array");
  }

  return array
    .filter((item) => item && typeof item === "object")
    .map((item, index): InsightCard => ({
      id: typeof item.id === "string" ? item.id : `insight_${index + 1}`,
      icon: typeof item.icon === "string" ? item.icon : defaultIconForPriority(item.priority),
      title: typeof item.title === "string" ? item.title : "Insight",
      body: typeof item.body === "string" ? item.body : "No insight body provided.",
      priority: item.priority === "high" || item.priority === "medium" || item.priority === "low" ? item.priority : "medium",
      actionLabel: typeof item.actionLabel === "string" ? item.actionLabel : null,
      actionRoute: typeof item.actionRoute === "string" ? item.actionRoute : null
    }))
    .sort(prioritySort);
}

function defaultIconForPriority(priority: unknown) {
  if (priority === "high") return "Sparkles";
  if (priority === "low") return "Gauge";
  return "TrendingUp";
}

function prioritySort(a: InsightCard, b: InsightCard) {
  const order = { high: 0, medium: 1, low: 2 };
  return order[a.priority] - order[b.priority];
}

export const insightIconMap = {
  Sparkles,
  TrendingUp,
  Target,
  Gauge
};
