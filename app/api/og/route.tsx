import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * OG 이미지 자동 생성 API
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

    const bgColor = letter.ogBgColor || "#FFF5F5";
    const gradientColor = adjustColor(bgColor, -10);

    // OG 이미지 생성 (엽서 형태)
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
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(135deg, ${bgColor} 0%, ${gradientColor} 100%)`,
            padding: "60px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "60px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              maxWidth: "900px",
              border: "2px solid #FFB6C1",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "40px",
                width: "80px",
                height: "80px",
                border: "3px dashed #FFB6C1",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              💌
            </div>

            <div
              style={{
                fontSize: letter.ogFontSize || 48,
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
                marginBottom: "30px",
                lineHeight: 1.4,
              }}
            >
              {letter.ogPreviewMessage ||
                letter.title ||
                "당신에게 도착한 편지"}
            </div>

            {letter.ogIllustration && (
              <div
                style={{
                  fontSize: "80px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {letter.ogIllustration}
              </div>
            )}

            <div
              style={{
                fontSize: "24px",
                color: "#999",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              Letter Community
            </div>
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

// 색상 밝기 조절 헬퍼 함수
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00ff) + amount);
    const b = clamp((num & 0x0000ff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
  return color;
}
