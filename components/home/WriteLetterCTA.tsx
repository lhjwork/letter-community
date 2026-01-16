"use client";

import Link from "next/link";

export default function WriteLetterCTA() {
  return (
    <section className="text-center py-12">
      {/* AI 아이콘 */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full text-white font-bold text-2xl mb-6 shadow-lg">AI</div>

      {/* 메시지 */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">특별한 편지 보내세요 만들어보세요</h2>
      <p className="text-gray-600 mb-8">AI가 도와드리는 편지 작성으로 더욱 특별하게</p>

      {/* CTA 버튼 */}
      <Link href="/write" className="inline-block px-8 py-4 bg-[#FF8B7B] text-white rounded-full font-semibold hover:bg-[#ff7a68] transition-colors shadow-lg hover:shadow-xl">
        편지 작성하러 가기
      </Link>
    </section>
  );
}
