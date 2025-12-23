import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Disable telemetry for Vercel AI SDK
process.env.VERCEL_AI_TELEMETRY_OPT_OUT = "1";

const TITLE_GENERATION_PROMPT = `
편지 내용을 분석하여 적절한 제목을 생성해주세요.

규칙:
1. 제목은 10-20자 이내로 작성
2. 편지의 핵심 감정이나 메시지를 담아야 함
3. 따뜻하고 친근한 톤으로 작성
4. 특수문자나 이모지 사용 금지
5. 한국어로 작성

편지 내용:
{content}

제목만 반환해주세요.
`;

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return Response.json({ error: "편지 내용이 필요합니다." }, { status: 400 });
    }

    // HTML 태그 제거하여 순수 텍스트만 추출
    const plainContent = content.replace(/<[^>]*>/g, "").trim();

    if (plainContent.length < 10) {
      return Response.json({ error: "편지 내용이 너무 짧습니다. 최소 10자 이상 작성해주세요." }, { status: 400 });
    }

    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt: TITLE_GENERATION_PROMPT.replace("{content}", plainContent),
      schema: z.object({
        title: z.string().describe("생성된 편지 제목"),
      }),
    });

    // 제목 길이 검증 및 조정
    let generatedTitle = result.object.title.trim();

    if (generatedTitle.length > 20) {
      generatedTitle = generatedTitle.substring(0, 20);
    }

    if (generatedTitle.length < 5) {
      generatedTitle = "마음을 전하는 편지";
    }

    return Response.json({
      title: generatedTitle,
      metadata: {
        originalLength: result.object.title.length,
        contentLength: plainContent.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("제목 생성 실패:", error);

    // 기본 제목 반환
    const fallbackTitles = ["마음을 전하는 편지", "소중한 사람에게", "따뜻한 안부 인사", "진심을 담은 편지", "특별한 메시지"];

    const randomTitle = fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];

    return Response.json({
      title: randomTitle,
      metadata: {
        fallback: true,
        error: "AI 생성 실패로 기본 제목 사용",
        generatedAt: new Date().toISOString(),
      },
    });
  }
}
