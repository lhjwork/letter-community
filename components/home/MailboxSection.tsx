"use client";

export default function MailboxSection() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 to-orange-50 rounded-3xl p-8 md:p-12 overflow-hidden">
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">편지를 받을 주소를 등록해주세요</h2>
        <p className="text-gray-600 mb-6">
          실제로 편지를 받고 싶은 주소를 등록하면
          <br />
          소중한 편지를 우편으로 받아보실 수 있어요
        </p>
        <button className="px-6 py-3 bg-[#FF8B7B] text-white rounded-full font-semibold hover:bg-[#ff7a68] transition-colors shadow-md">주소 등록하기</button>
      </div>

      {/* 우체통 일러스트 (우측) */}
      <div className="absolute right-8 bottom-8 hidden md:block">
        <div className="relative w-40 h-40">
          {/* 손 일러스트 */}
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 편지 */}
            <rect x="60" y="40" width="80" height="60" rx="4" fill="white" stroke="#333" strokeWidth="2" />
            <path d="M60 40 L100 70 L140 40" stroke="#333" strokeWidth="2" fill="none" />

            {/* 손 */}
            <ellipse cx="100" cy="140" rx="40" ry="30" fill="#FFD4C8" />
            <rect x="80" y="130" width="40" height="50" fill="#FFD4C8" />

            {/* 손가락 */}
            <ellipse cx="70" cy="125" rx="8" ry="15" fill="#FFD4C8" />
            <ellipse cx="130" cy="125" rx="8" ry="15" fill="#FFD4C8" />
          </svg>

          {/* AI 아이콘 */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">AI</div>
        </div>
      </div>
    </section>
  );
}
