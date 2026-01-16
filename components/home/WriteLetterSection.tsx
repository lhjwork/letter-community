"use client";

import Link from "next/link";

export default function WriteLetterSection() {
  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-20">
        {/* 타이틀 */}
        <div className="text-center mb-16">
          <h2 className="text-[52px] leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-4">전하고 싶은 말을 편지에 담아보세요</h2>
          <p className="text-2xl text-[#757575]">특별한 순간의 하루를 기록하는 편지</p>
        </div>

        {/* 편지 프리뷰 카드 */}
        <div className="relative max-w-[920px] mx-auto">
          {/* 하이라이트 박스 */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-[240px] h-14 bg-[#FF7F65] opacity-60 rounded" />

          {/* 메인 카드 */}
          <div className="relative bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl p-12 shadow-[12px_12px_40px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* 구멍들 */}
            <div className="absolute left-[18px] top-[50px] flex flex-col gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-[#FEFEFE] border border-[#75757533] shadow-inner" />
              ))}
            </div>

            {/* 세로 구분선 */}
            <div className="absolute left-[30px] top-[38px] bottom-[38px] w-px bg-[#FF9F99]" />

            {/* 가로 줄들 */}
            <div className="space-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-px bg-[#EDEDED]" />
              ))}
            </div>

            {/* To. 라벨 - 하이라이트 */}
            <div className="absolute top-[64px] left-[72px]">
              <div className="relative inline-block">
                <div className="absolute -left-2 -top-1 w-[52px] h-8 bg-[#FF7F65] border-[12px] border-[#FF7F65]" />
                <span className="relative text-2xl font-semibold text-[#FEFEFE]">To.</span>
              </div>
            </div>

            {/* 받는 사람 */}
            <div className="absolute top-[64px] left-[138px]">
              <span className="text-2xl font-semibold text-[#424242]">보내고 싶은 누군가</span>
            </div>

            {/* 날짜 */}
            <div className="absolute top-[68px] right-12">
              <span className="text-lg text-[#424242]">20xx.xx.xx</span>
            </div>

            {/* 내용 */}
            <div className="absolute top-[160px] left-[72px]">
              <div className="relative">
                <div className="absolute -left-3 -top-1 w-2 h-10 bg-[#424242]" />
                <span className="text-2xl font-semibold text-[#424242]">오늘 정말 기분 좋은일이</span>
              </div>
            </div>

            {/* 서명 */}
            <div className="absolute bottom-[68px] right-12 flex items-center gap-3">
              <div className="w-7 h-6">
                {/* 편지 아이콘 */}
                <svg viewBox="0 0 28 24" fill="none">
                  <path d="M2 0H26C27.1 0 28 0.9 28 2V22C28 23.1 27.1 24 26 24H2C0.9 24 0 23.1 0 22V2C0 0.9 0.9 0 2 0Z" fill="#FF7F65" />
                  <path d="M2 2L14 13L26 2" stroke="black" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <span className="text-xl font-medium text-[#424242]">레터 이용자</span>
            </div>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex justify-center gap-8 mt-16">
          <Link href="/write?type=story" className="px-6 py-4 bg-[#FF7F65] text-[#F9F9F9] text-2xl font-semibold rounded hover:bg-[#FF6B50] transition-colors">
            사연 신청하기
          </Link>
          <Link href="/stories" className="px-6 py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors">
            사연 보러가기
          </Link>
        </div>
      </div>
    </section>
  );
}
