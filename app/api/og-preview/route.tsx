import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * 미리보기용 OG 이미지 임시 렌더 API
 * URL: /api/og-preview?message=xxx&bgColor=xxx&illustration=xxx&fontSize=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const message = searchParams.get("message") || "당신에게 도착한 편지";
    const bgColor = searchParams.get("bgColor") || "#FFF5F5";
    const illustration = searchParams.get("illustration") || "💌";
    const fontSize = parseInt(searchParams.get("fontSize") || "48");

    const gradientColor = adjustColor(bgColor, -10);

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
                fontSize: fontSize,
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
                marginBottom: "30px",
                lineHeight: 1.4,
              }}
            >
              {message}
            </div>

            {illustration && (
              <div
                style={{
                  fontSize: "80px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {illustration}
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
    console.error("OG Preview generation error:", error);
    return new Response("Failed to generate preview", { status: 500 });
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
