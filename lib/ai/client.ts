// ⚠️ Anthropic API 크레딧 소진으로 일시 비활성화 (2026-08-04)
// 크레딧 결제 후 아래 import와 getHaikuModel()의 주석을 해제하세요.
// import { anthropic } from "@ai-sdk/anthropic";

/**
 * AI Kill Switch - set AI_ENABLED=false to disable all AI features instantly
 *
 * 크레딧 소진으로 현재는 환경 변수와 무관하게 항상 false를 반환합니다.
 * 크레딧 결제 후 아래 return을 원래 구현으로 되돌리세요.
 */
export function isAIEnabled(): boolean {
  return false;
  // return process.env.AI_ENABLED !== "false";
}

/**
 * Get Claude Haiku 4.5 model (MVP only model)
 */
// export function getHaikuModel() {
//   return anthropic("claude-haiku-4-5-20251001");
// }

/**
 * AI disabled fallback response
 */
export const AI_DISABLED_MESSAGE = "오늘은 잠시 쉴게요. 나중에 다시 시도해주세요.";
