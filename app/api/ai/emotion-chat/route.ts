// ⚠️ Anthropic API 크레딧 소진으로 일시 비활성화 (2026-08-04)
// 크레딧 결제 후: 아래 임시 응답을 지우고 파일 하단의 원본 구현 주석을 해제하세요.
import { AI_DISABLED_MESSAGE } from "@/lib/ai/client";

export async function POST() {
  return Response.json({ error: AI_DISABLED_MESSAGE }, { status: 503 });
}

/* ===== 크레딧 결제 후 복구할 원본 구현 =====
import { streamText } from "ai";
import { isAIEnabled, getHaikuModel, AI_DISABLED_MESSAGE } from "@/lib/ai/client";
import {
  EMOTION_CHAT_SYSTEM_PROMPT,
  buildChatMessages,
  type ChatMessage,
} from "@/lib/ai/prompts/emotion-chat";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { auth } from "@/auth";

export async function POST(req: Request) {
  // Kill switch
  if (!isAIEnabled()) {
    return Response.json(
      { error: AI_DISABLED_MESSAGE },
      { status: 503 }
    );
  }

  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // Rate limit
  const rateLimitResult = checkRateLimit(session.user.id);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: rateLimitResult.message },
      { status: 429 }
    );
  }

  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: "메시지가 필요합니다." },
        { status: 400 }
      );
    }

    // 최근 5턴만 유지
    const trimmedMessages = buildChatMessages(messages);

    const result = streamText({
      model: getHaikuModel(),
      maxOutputTokens: 60,
      temperature: 0.85,
      system: EMOTION_CHAT_SYSTEM_PROMPT,
      messages: trimmedMessages,
      providerOptions: {
        anthropic: {
          cacheControl: { type: "ephemeral" },
        },
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[emotion-chat] Error:", error);
    return Response.json(
      { error: "지금은 대화할 수 없어요." },
      { status: 500 }
    );
  }
}
===== 원본 구현 끝 ===== */
