"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import type { Story } from "@/lib/api";

interface StoryCardProps {
  story: Story;
}

function StoryCard({ story }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };

  return (
    <Link href={`/letter/${story._id}`} className="block w-full">
      <div className="bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl w-full h-[280px] sm:h-[312px] relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Horizontal lines - 6 lines at intervals */}
        {[48, 96, 144, 192, 240, 288].map((lineY) => (
          <div
            key={lineY}
            className="absolute left-0 right-0 h-0.5 bg-[#EDEDED]"
            style={{ top: `${lineY}px` }}
          />
        ))}

        {/* Envelope icon - top left */}
        <div className="absolute top-3.5 left-3">
          <Image src="/icons/envelope-icon.png" alt="" width={28} height={24} className="w-7 h-6" />
        </div>

        {/* Date - top right */}
        <div className="absolute top-4 right-3 sm:right-4">
          <span className="text-[16px] sm:text-[18px] text-[#424242] font-['Pretendard']">
            {formatDate(story.createdAt)}
          </span>
        </div>

        {/* To. label */}
        <div className="absolute top-14 left-[50px] sm:left-[60px]">
          <span className="text-[20px] sm:text-[24px] font-semibold text-[#424242] font-['Pretendard']">
            To.
          </span>
        </div>

        {/* Title/Content preview */}
        <div className="absolute top-[100px] left-4 right-4 sm:left-5 sm:right-5">
          <p className="text-[15px] sm:text-[16px] text-[#424242] line-clamp-3 leading-relaxed font-['Pretendard']">
            {story.title ||
              (story.content
                ? story.content.replace(/<[^>]*>/g, "").substring(0, 80)
                : "")}
          </p>
        </div>

        {/* Author - bottom right */}
        <div className="absolute bottom-4 right-3 sm:right-4">
          <span className="text-[18px] sm:text-[20px] font-medium text-[#424242] font-['Pretendard']">
            {story.authorName || "익명"}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface StoryListSectionProps {
  stories: Story[];
}

export default function StoryListSection({ stories }: StoryListSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const totalStories = stories.length;

  // Cards per page based on viewport
  const getCardsPerPage = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  };

  const [cardsPerPage, setCardsPerPage] = useState(4);

  useEffect(() => {
    const update = () => {
      const newPerPage = getCardsPerPage();
      setCardsPerPage(newPerPage);
      setCurrentPage(0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(totalStories / cardsPerPage);

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

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const displayPageNum = String(currentPage + 1).padStart(2, "0");
  const displayTotal = String(totalPages).padStart(2, "0");

  return (
    <section className="w-full py-10 sm:py-16">
      <div
        ref={sectionRef}
        className="container mx-auto px-4 sm:px-8 lg:px-10"
      >
        {/* Title */}
        <div
          className={`text-center mb-4 sm:mb-6 scroll-reveal ${inView ? "in-view" : ""}`}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-2 sm:mb-5">
            사연을 남겨주세요
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[#757575] font-['Pretendard']">
            당신의 이야기가 한장의 편지로 이어집니다
          </p>
        </div>

        {/* Controls row: indicator left, arrows right */}
        <div
          className={`flex items-center justify-between mb-6 sm:mb-8 scroll-reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          {/* Page indicator */}
          <div className="font-['Pretendard'] font-medium text-3xl sm:text-[48px] leading-none select-none">
            <span className="text-[#757575]">{displayPageNum}</span>
            <span className="text-[#C4C4C4]"> / {displayTotal}</span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-5">
            {/* Left (prev) button */}
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 bg-[#EDEDED] hover:bg-[#ddd]"
              aria-label="이전"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M10.8 12L14.7 15.9C14.8834 16.0834 14.975 16.3167 14.975 16.6C14.975 16.8834 14.8834 17.1167 14.7 17.3C14.5167 17.4834 14.2834 17.575 14 17.575C13.7167 17.575 13.4834 17.4834 13.3 17.3L8.70005 12.7C8.60005 12.6 8.52922 12.4917 8.48755 12.375C8.44588 12.2584 8.42505 12.1334 8.42505 12C8.42505 11.8667 8.44588 11.7417 8.48755 11.625C8.52922 11.5084 8.60005 11.4 8.70005 11.3L13.3 6.70005C13.4834 6.51672 13.7167 6.42505 14 6.42505C14.2834 6.42505 14.5167 6.51672 14.7 6.70005C14.8834 6.88338 14.975 7.11672 14.975 7.40005C14.975 7.68338 14.8834 7.91672 14.7 8.10005L10.8 12Z"
                  fill="#757575"
                />
              </svg>
            </button>

            {/* Right (next) button */}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 bg-[#FF7F65] hover:bg-[#ff6b50]"
              aria-label="다음"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M13.2 12L9.29995 8.09995C9.11662 7.91662 9.02495 7.68328 9.02495 7.39995C9.02495 7.11662 9.11662 6.88328 9.29995 6.69995C9.48329 6.51662 9.71662 6.42495 9.99995 6.42495C10.2833 6.42495 10.5166 6.51662 10.7 6.69995L15.3 11.3C15.4 11.4 15.4708 11.5083 15.5125 11.625C15.5541 11.7416 15.575 11.8666 15.575 12C15.575 12.1333 15.5541 12.2583 15.5125 12.375C15.4708 12.4916 15.4 12.6 15.3 12.7L10.7 17.3C10.5166 17.4833 10.2833 17.575 9.99995 17.575C9.71662 17.575 9.48328 17.4833 9.29995 17.3C9.11662 17.1166 9.02495 16.8833 9.02495 16.6C9.02495 16.3166 9.11662 16.0833 9.29995 15.9L13.2 12Z"
                  fill="#FEFEFE"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards grid - shows current page */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 scroll-reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          {stories
            .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
            .map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
        </div>

        {/* More button */}
        <div
          className={`flex justify-center mt-8 sm:mt-12 scroll-reveal ${inView ? "in-view" : ""}`}
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="/stories"
            className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors"
          >
            더 많은 사연 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
