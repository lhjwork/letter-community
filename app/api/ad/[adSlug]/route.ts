import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adSlug: string }> }
) {
  try {
    const { adSlug } = await params;
    const response = await fetch(`${BACKEND_URL}/api/ads/${adSlug}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ad fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}
