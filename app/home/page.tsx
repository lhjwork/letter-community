"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import AdCarousel from "@/components/ads/AdCarousel";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 환영 메시지 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-pink-200">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            안녕하세요, {session?.user?.name}님! 💌
          </h1>
          <p className="text-gray-600 text-lg">
            Letter Community에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 빠른 액션 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/write"
            className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-2 border-pink-200 group"
          >
            <div className="text-4xl mb-4">✍️</div>
            <h3
              className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              편지 쓰기
            </h3>
            <p className="text-gray-600">특별한 사연을 작성해보세요</p>
          </Link>

          <Link
            href="/my-page"
            className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-2 border-purple-200 group"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3
              className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              내 편지함
            </h3>
            <p className="text-gray-600">작성한 편지를 확인하세요</p>
          </Link>

          <Link
            href="/stories"
            className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-2 border-blue-200 group"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3
              className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              사연 목록
            </h3>
            <p className="text-gray-600">다른 사람들의 이야기를 읽어보세요</p>
          </Link>
        </div>

        {/* 홈페이지 캐러셀 광고 */}
        <AdCarousel
          placement="banner"
          limit={3}
          aspectRatio="16:9"
          autoPlay={true}
          autoPlayInterval={5000}
          showControls={true}
          showIndicators={true}
          className="mb-8"
          showDebugInfo={process.env.NODE_ENV === "development"}
        />

        {/* 시작 가이드 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
          <h2
            className="text-3xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            시작하기
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  첫 번째 편지를 작성해보세요
                </h4>
                <p className="text-sm text-gray-600">
                  당신의 이야기를 아름다운 편지로 만들어보세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  공유 이미지를 커스터마이징하세요
                </h4>
                <p className="text-sm text-gray-600">
                  편지를 작성한 후 OG 이미지를 예쁘게 꾸며보세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl">🔗</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  SNS에 공유하세요
                </h4>
                <p className="text-sm text-gray-600">
                  작성한 편지를 소셜 미디어로 공유해보세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
