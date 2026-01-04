import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 클라이언트 IP 추출
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 백엔드로 전달
    const response = await fetch(`${BACKEND_URL}/api/ads/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, ip }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad tracking error:", error);
    // 에러여도 200 반환 (추적 실패가 사용자 경험에 영향 주지 않도록)
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
