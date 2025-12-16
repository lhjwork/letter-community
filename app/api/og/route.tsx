import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * OG 이미지 고정 포맷 생성 API (MVP)
 * URL: /api/og?letterId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const letterId = searchParams.get("letterId");

    if (!letterId) {
      return new Response("letterId is required", { status: 400 });
    }

    // 백엔드에서 편지 정보 가져오기
    const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`);
    if (!response.ok) {
      return new Response("Letter not found", { status: 404 });
    }

    const { data: letter } = await response.json();

    const ogTitle = letter.ogTitle || "당신에게 도착한 편지";
    const ogPreviewText =
      letter.ogPreviewText ||
      letter.content?.slice(0, 60) ||
      "특별한 편지가 도착했습니다.";

    // 고정 포맷 OG 이미지 생성
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF5F5",
            backgroundImage:
              "linear-gradient(135deg, #FFF5F5 0%, #FFE4E1 100%)",
            padding: "60px",
            fontFamily: "sans-serif",
          }}
        >
          {/* 브랜드 로고/타이틀 */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#FF6B9D",
              marginBottom: "40px",
              letterSpacing: "2px",
            }}
          >
            LETTER
          </div>

          {/* 중앙 봉투 일러스트 */}
          <div
            style={{
              fontSize: "120px",
              marginBottom: "40px",
            }}
          >
            💌
          </div>

          {/* 편지 제목 */}
          {ogTitle && (
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
                marginBottom: "20px",
                maxWidth: "900px",
              }}
            >
              {ogTitle}
            </div>
          )}

          {/* 편지 미리보기 텍스트 */}
          <div
            style={{
              fontSize: "28px",
              color: "#666",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
            }}
          >
            {ogPreviewText}
          </div>

          {/* 하단 안내 */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              fontSize: "20px",
              color: "#999",
            }}
          >
            편지를 확인하려면 클릭하세요
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
