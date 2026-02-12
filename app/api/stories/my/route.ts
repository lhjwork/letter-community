import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 백엔드 토큰 확인
    if (!session.backendToken) {
      return NextResponse.json(
        { success: false, error: "Backend token not found" },
        { status: 401 },
      );
    }

    // 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/stories/my${queryString ? `?${queryString}` : ""}`;

    // 백엔드 API 호출
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("백엔드 API 오류:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch stories from backend" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("사연 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
