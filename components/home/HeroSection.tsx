"use client";

interface HeroSectionProps {
  onLoginClick: () => void;
}

export default function HeroSection({ onLoginClick }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#FF8B7B] to-[#FFA590] rounded-3xl p-8 md:p-12 shadow-lg overflow-hidden">
      {/* 상단 배지 */}
      <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">비로그인 상태입니다</div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Letter,
          <br />
          진심을 전하는 편지니!
        </h1>
      </div>

      {/* 하트 일러스트 (우측) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
        <div className="relative w-32 h-32 bg-white rounded-2xl shadow-xl p-4 transform rotate-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          {/* 카드 모서리 장식 */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-gray-300"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gray-300"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gray-300"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-gray-300"></div>
        </div>
      </div>

      {/* AI 아이콘 (하단 우측) */}
      <button
        onClick={onLoginClick}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="AI 도우미"
      >
        AI
      </button>
    </section>
  );
}
