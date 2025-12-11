"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
            당신의 이야기를 <br />
            편지로 전하세요 💌
          </h1>
          <p className="text-xl text-gray-600 mb-8">Letter Community에서 특별한 순간을 아름다운 편지로 만들어보세요</p>
          <div className="flex gap-4 justify-center">
            <Link href="/write" className="px-8 py-4 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl">
              편지 쓰러 가기
            </Link>
            <Link href="/stories" className="px-8 py-4 bg-white text-pink-500 border-2 border-pink-500 rounded-full hover:bg-pink-50 transition-colors text-lg font-semibold shadow-lg">
              사연 둘러보기
            </Link>
          </div>
        </div>

        {/* 특징 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-pink-200">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              쉬운 작성
            </h3>
            <p className="text-gray-600">간편한 에디터로 당신의 이야기를 아름답게 작성하세요</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              커스텀 이미지
            </h3>
            <p className="text-gray-600">SNS 공유용 이미지를 예쁘게 커스터마이징할 수 있어요</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              간편한 공유
            </h3>
            <p className="text-gray-600">작성한 편지를 링크 하나로 손쉽게 공유하세요</p>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">로그인하고 첫 번째 편지를 작성해보세요</p>
          <Link href="/write" className="inline-block px-10 py-4 bg-white text-pink-500 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg">
            시작하기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
