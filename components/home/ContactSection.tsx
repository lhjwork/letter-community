"use client";

export default function ContactSection() {
  return (
    <section className="w-full py-24 border-t border-[#C4C4C4]">
      <div className="container mx-auto px-20">
        <div className="text-center">
          <h2 className="text-[52px] leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-12">
            도움이 필요하다면 언제든 연락주세요
          </h2>
          <button className="px-6 py-4 bg-[#FF7F65] text-[#F9F9F9] text-2xl font-semibold rounded hover:bg-[#FF6B50] transition-colors">
            서비스 문의하기
          </button>
        </div>
      </div>
    </section>
  );
}
