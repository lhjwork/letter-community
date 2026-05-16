import { generateText } from "ai";
import { z } from "zod";
import { isAIEnabled, getHaikuModel, AI_DISABLED_MESSAGE } from "@/lib/ai/client";
import {
  WRITING_ASSIST_SYSTEM_PROMPT,
  buildWritingAssistPrompt,
} from "@/lib/ai/prompts/writing-assist";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { auth } from "@/auth";

const RequestSchema = z.object({
  content: z.string().min(10, "최소 10자 이상의 편지 내용이 필요합니다."),
});

export async function POST(request: Request) {
  // Kill switch check
  if (!isAIEnabled()) {
    return Response.json(
      { error: AI_DISABLED_MESSAGE, suggestion: null },
      { status: 503 }
    );
  }

  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: "로그인이 필요합니다.", suggestion: null },
      { status: 401 }
    );
  }

  // Rate limit check
  const rateLimitResult = checkRateLimit(session.user.id);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: rateLimitResult.message, suggestion: null },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message, suggestion: null },
        { status: 400 }
      );
    }

    // HTML 태그 제거
    const plainContent = parsed.data.content.replace(/<[^>]*>/g, "").trim();

    if (plainContent.length < 10) {
      return Response.json(
        { error: "편지 내용이 너무 짧습니다.", suggestion: null },
        { status: 400 }
      );
    }

    // 너무 긴 내용은 최근 500자만 사용 (토큰 절약)
    const truncatedContent =
      plainContent.length > 500
        ? plainContent.slice(-500)
        : plainContent;

    const result = await generateText({
      model: getHaikuModel(),
      maxOutputTokens: 60,
      temperature: 0.8,
      system: WRITING_ASSIST_SYSTEM_PROMPT,
      prompt: buildWritingAssistPrompt(truncatedContent),
      providerOptions: {
        anthropic: {
          cacheControl: { type: "ephemeral" },
        },
      },
    });

    const suggestion = result.text.trim().replace(/^["']|["']$/g, "");

    return Response.json({
      suggestion,
      usage: {
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
      },
    });
  } catch (error) {
    console.error("[writing-assist] Error:", error);
    return Response.json(
      { error: "제안을 생성할 수 없습니다.", suggestion: null },
      { status: 500 }
    );
  }
}
