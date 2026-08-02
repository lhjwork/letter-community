"use client";

import { useRef, useEffect, useState } from "react";

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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
    <section className="w-full py-12 sm:py-24 border-t border-[#C4C4C4]">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20">
        <div
          ref={sectionRef}
          className={`text-center scroll-reveal ${inView ? "in-view" : ""}`}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-6 sm:mb-12">
            도움이 필요하다면 언제든 연락주세요
          </h2>
          <button className="px-6 py-3 sm:py-4 bg-[#FF7F65] text-[#F9F9F9] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FF6B50] hover:scale-105 active:scale-95 hover:shadow-[0_8px_25px_rgba(255,127,101,0.4)] transition-all">
            서비스 문의하기
          </button>
        </div>
      </div>
    </section>
  );
}
