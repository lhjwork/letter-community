import { generateText } from "ai";
import { isAIEnabled, getHaikuModel, AI_DISABLED_MESSAGE } from "@/lib/ai/client";
import {
  DAILY_PROMPT_SYSTEM_PROMPT,
  buildDailyPromptMessage,
  getDailyPromptCacheKey,
} from "@/lib/ai/prompts/daily-prompt";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { getCached, setCache } from "@/lib/ai/cache";
import { auth } from "@/auth";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

export async function POST() {
  // Kill switch check
  if (!isAIEnabled()) {
    return Response.json(
      { error: AI_DISABLED_MESSAGE, question: null },
      { status: 503 }
    );
  }

  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: "로그인이 필요합니다.", question: null },
      { status: 401 }
    );
  }

  // Check cache first
  const cacheKey = getDailyPromptCacheKey(session.user.id);
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return Response.json({ question: cached });
  }

  // Rate limit check
  const rateLimitResult = checkRateLimit(session.user.id);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: rateLimitResult.message, question: null },
      { status: 429 }
    );
  }

  try {
    // TODO: 사용자별 최근 7일 감정 카테고리 조회 (DB 연동 후 활성화)
    const recentEmotions: string[] | undefined = undefined;

    const result = await generateText({
      model: getHaikuModel(),
      maxOutputTokens: 80,
      temperature: 0.9,
      system: DAILY_PROMPT_SYSTEM_PROMPT,
      prompt: buildDailyPromptMessage(recentEmotions),
      providerOptions: {
        anthropic: {
          cacheControl: { type: "ephemeral" },
        },
      },
    });

    const question = result.text.trim().replace(/^[\"'"""]|[\"'"""]$/g, "");

    // Cache the result for 30 minutes
    setCache(cacheKey, question, CACHE_TTL_MS);

    return Response.json({
      question,
      usage: {
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
      },
    });
  } catch (error) {
    console.error("[daily-prompt] Error:", error);
    return Response.json(
      { error: "질문을 생성할 수 없습니다.", question: null },
      { status: 500 }
    );
  }
}
