"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef, useEffect, useState } from "react";
import LoginDialog from "@/components/shareds/LoginDialog";

export default function WriteLetterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20">
        {/* Title - scroll reveal */}
        <div className={`text-center mb-8 sm:mb-16 scroll-reveal ${inView ? "in-view" : ""}`}>
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-2 sm:mb-4">전하고 싶은 말을 편지에 담아보세요</h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[#757575]">특별한 순간의 하루를 기록하는 편지</p>
        </div>

        {/* Letter preview card */}
        <div
          ref={sectionRef}
          className={`relative max-w-[920px] mx-auto scroll-reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          {/* Highlight box */}
          <div
            className={`absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 w-[160px] sm:w-[240px] h-10 sm:h-14 bg-[#FF7F65] opacity-60 rounded line-reveal`}
            style={{ animationDelay: "0.3s" }}
          />

          {/* Main card */}
          <div className="relative bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl p-6 sm:p-12 shadow-[12px_12px_40px_rgba(0,0,0,0.12)] overflow-hidden min-h-[280px] sm:min-h-0 transition-shadow duration-300 hover:shadow-[16px_16px_50px_rgba(0,0,0,0.16)]">
            {/* Holes - hidden on mobile */}
            <div className="hidden sm:flex absolute left-[18px] top-[50px] flex-col gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-[#FEFEFE] border border-[#75757533] shadow-inner" />
              ))}
            </div>

            {/* Vertical line - hidden on mobile */}
            <div className="hidden sm:block absolute left-[30px] top-[38px] bottom-[38px] w-px bg-[#FF9F99]" />

            {/* Horizontal lines - CSS animated */}
            <div className="space-y-8 sm:space-y-12">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-[#EDEDED] line-reveal"
                  style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                />
              ))}
            </div>

            {/* To. label */}
            <div
              className="absolute top-[40px] sm:top-[64px] left-[24px] sm:left-[72px] content-reveal"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="relative inline-block">
                <div className="absolute -left-2 -top-1 w-[42px] sm:w-[52px] h-7 sm:h-8 bg-[#FF7F65] border-[10px] sm:border-[12px] border-[#FF7F65]" />
                <span className="relative text-lg sm:text-2xl font-semibold text-[#FEFEFE]">To.</span>
              </div>
            </div>

            {/* Recipient */}
            <div
              className="absolute top-[40px] sm:top-[64px] left-[80px] sm:left-[138px] content-reveal"
              style={{ animationDelay: "0.7s" }}
            >
              <span className="text-base sm:text-2xl font-semibold text-[#424242]">보내고 싶은 누군가</span>
            </div>

            {/* Date */}
            <div
              className="absolute top-[44px] sm:top-[68px] right-6 sm:right-12 content-reveal"
              style={{ animationDelay: "0.8s" }}
            >
              <span className="text-sm sm:text-lg text-[#424242]">20xx.xx.xx</span>
            </div>

            {/* Content */}
            <div
              className="absolute top-[100px] sm:top-[160px] left-[24px] sm:left-[72px] content-reveal"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="relative">
                <div className="absolute -left-3 -top-1 w-2 h-8 sm:h-10 bg-[#424242]" />
                <span className="text-base sm:text-2xl font-semibold text-[#424242]">오늘 정말 기분 좋은일이</span>
              </div>
            </div>

            {/* Signature */}
            <div
              className="absolute bottom-[40px] sm:bottom-[68px] right-6 sm:right-12 flex items-center gap-2 sm:gap-3 content-reveal"
              style={{ animationDelay: "1.0s" }}
            >
              <Image src="/icons/envelope-icon-small.png" alt="" width={28} height={24} className="w-5 h-4 sm:w-7 sm:h-6" />
              <span className="text-base sm:text-xl font-medium text-[#424242]">레터 이용자</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          className={`flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-8 sm:mt-16 scroll-reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          <button
            onClick={() => {
              if (session) {
                router.push("/write?type=story");
              } else {
                setShowLogin(true);
              }
            }}
            className="block w-full sm:w-auto px-6 py-3 sm:py-4 bg-[#FF7F65] text-[#F9F9F9] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FF6B50] transition-colors text-center"
          >
            사연 신청하기
          </button>
          <Link href="/stories" className="block px-6 py-3 sm:py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors text-center">
            사연 보러가기
          </Link>
        </div>
      </div>

      <LoginDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        callbackUrl="/write?type=story"
      />
    </section>
  );
}
