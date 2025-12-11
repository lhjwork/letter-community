import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const letterId = searchParams.get("letterId");

  if (!letterId) {
    return new Response("Missing letterId", { status: 400 });
  }

  // 실제로는 백엔드 API를 호출하여 편지 정보를 가져와야 함
  // const res = await fetch(`${process.env.API_URL}/letters/${letterId}`);
  // const letter = await res.json();

  // Mock Data
  const letter = {
    title: "특별한 편지가 도착했습니다",
    content: "소중한 마음을 전하는 편지입니다.",
    bgColor: "#f0f9ff",
    illustration: "cat",
  };

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
          backgroundColor: letter.bgColor,
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 30 }}>{getIllustration(letter.illustration)}</div>
        <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 20, textAlign: "center", padding: "0 40px" }}>{letter.title}</div>
        <div style={{ fontSize: 30, opacity: 0.8 }}>Letter Community에서 확인하세요</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
