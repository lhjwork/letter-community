import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// 카테고리 스키마 정의
const categorySchema = z.object({
  category: z.enum([
    "가족",
    "사랑",
    "우정",
    "성장",
    "위로",
    "추억",
    "감사",
    "기타",
  ]),
  confidence: z.number().min(0).max(1).describe("분류 신뢰도 (0-1)"),
  reason: z.string().describe("카테고리 선택 이유"),
  tags: z.array(z.string()).max(5).describe("관련 태그 (최대 5개)"),
});

export const maxDuration = 30; // Vercel 타임아웃 설정

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    // 입력 검증
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "제목과 내용이 필요합니다",
        },
        { status: 400 }
      );
    }

    // 너무 짧은 내용은 기본 카테고리로
    if (content.length < 20) {
      return NextResponse.json({
        success: true,
        data: {
          category: "기타",
          confidence: 0.5,
          reason: "내용이 너무 짧아 자동 분류가 어렵습니다",
          tags: [],
        },
      });
    }

    // Google Gemini로 AI 분류 (무료!)
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: categorySchema,
      prompt: `
당신은 사연 분류 전문가입니다. 다음 사연을 분석하고 가장 적합한 카테고리를 선택해주세요.

## 카테고리 설명

- **가족**: 부모님, 형제자매, 가족 관계에 관한 이야기
- **사랑**: 연애, 짝사랑, 이별, 사랑에 관한 이야기
- **우정**: 친구, 동료와의 관계에 관한 이야기
- **성장**: 자기계발, 극복, 성취, 도전에 관한 이야기
- **위로**: 힐링, 공감, 응원이 필요한 이야기
- **추억**: 과거 회상, 그리움, 추억에 관한 이야기
- **감사**: 고마움, 감사 표현에 관한 이야기
- **기타**: 위 카테고리에 해당하지 않는 이야기

## 분석할 사연

**제목**: ${title}

**내용**: ${content}

## 분석 기준

1. 사연의 주요 감정과 주제를 파악하세요
2. 가장 핵심적인 카테고리 **1개만** 선택하세요
3. 신뢰도(confidence)는 0-1 사이 값으로 표현하세요
   - 0.8 이상: 매우 확실함
   - 0.6-0.8: 확실함
   - 0.4-0.6: 보통
   - 0.4 미만: 불확실함
4. 선택 이유를 한 문장으로 간단히 설명하세요
5. 관련 태그 3-5개를 추출하세요 (예: "엄마", "그리움", "사랑" 등)

한국어로 응답해주세요.
      `.trim(),
      temperature: 0.3, // 일관성 있는 분류를 위해 낮은 값
    });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error) {
    console.error("AI 분류 오류:", error);

    // 에러 시 기본 카테고리 반환
    return NextResponse.json(
      {
        success: false,
        error: "AI 분류에 실패했습니다",
        fallback: {
          category: "기타",
          confidence: 0,
          reason: "자동 분류 실패",
          tags: [],
        },
      },
      { status: 500 }
    );
  }
}
