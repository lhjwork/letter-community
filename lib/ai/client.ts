import { anthropic } from "@ai-sdk/anthropic";

/**
 * AI Kill Switch - set AI_ENABLED=false to disable all AI features instantly
 */
export function isAIEnabled(): boolean {
  return process.env.AI_ENABLED !== "false";
}

/**
 * Get Claude Haiku 4.5 model (MVP only model)
 */
export function getHaikuModel() {
  return anthropic("claude-haiku-4-5-20251001");
}

/**
 * AI disabled fallback response
 */
export const AI_DISABLED_MESSAGE = "오늘은 잠시 쉴게요. 나중에 다시 시도해주세요.";
