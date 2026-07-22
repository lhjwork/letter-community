import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

/**
 * OG 이미지 - 항상 브랜드 로고 이미지를 반환
 * S3 무료 서비스 종료로 편지별 동적 이미지 대신 고정 로고 사용
 * URL: /api/og (letterId 파라미터 무시)
 */
export async function GET() {
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
            padding: "60px",
            fontFamily: "sans-serif",
          }}
        >
          {/* 봉투 아이콘 */}
          <div
            style={{
              fontSize: "140px",
              marginBottom: "30px",
            }}
          >
            💌
          </div>

          {/* 브랜드 로고 */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#FF6B9D",
              marginBottom: "20px",
              letterSpacing: "6px",
            }}
          >
            LETTER
          </div>

          {/* 슬로건 */}
          <div
            style={{
              fontSize: "28px",
              color: "#999",
              textAlign: "center",
            }}
          >
            편지로 마음을 전하는 특별한 공간
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
