import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * OG 이미지 - 편지 하트 아이콘 + 본문 미리보기(최대 2줄)
 * URL: /api/og?text=<본문 앞부분>
 */
export async function GET(request: NextRequest) {
  const text = (request.nextUrl.searchParams.get("text") || "편지로 마음을 전하는 특별한 공간").slice(0, 120);
  const iconUrl = `${request.nextUrl.origin}/icons/letter-heart-icon.svg`;

  try {
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
            backgroundImage: "linear-gradient(135deg, #FFF5F5 0%, #FFE4E1 100%)",
            padding: "80px 120px",
            fontFamily: "sans-serif",
          }}
        >
          {/* 편지 하트 아이콘 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconUrl} width={200} height={180} alt="" style={{ marginBottom: "48px" }} />

          {/* 본문 미리보기 (2줄) */}
          <div
            style={{
              display: "block",
              fontSize: "40px",
              lineHeight: 1.5,
              color: "#424242",
              textAlign: "center",
              maxWidth: "960px",
              lineClamp: 2,
              overflow: "hidden",
            }}
          >
            {text}
          </div>

          {/* 브랜드 */}
          <div style={{ position: "absolute", bottom: "40px", fontSize: "26px", color: "#FF9883", letterSpacing: "6px" }}>
            LETTER
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
