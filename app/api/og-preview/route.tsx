import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message") || "특별한 순간을 편지로 남겨보세요";
  const bgColor = searchParams.get("bgColor") || "#ffffff";
  const illustration = searchParams.get("illustration") || "default";
  const fontSize = searchParams.get("fontSize") || "48";

  // 일러스트 매핑 (실제로는 이미지 URL이나 SVG 코드를 사용해야 함)
  const getIllustration = (type: string) => {
    switch (type) {
      case "cat":
        return "🐱";
      case "heart":
        return "❤️";
      case "star":
        return "⭐";
      default:
        return "✉️";
    }
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          fontSize: parseInt(fontSize),
          fontWeight: 600,
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>{getIllustration(illustration)}</div>
        <div style={{ padding: "0 40px", textAlign: "center", wordBreak: "keep-all", lineHeight: 1.4 }}>{message}</div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 24, opacity: 0.6 }}>Letter Community</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
