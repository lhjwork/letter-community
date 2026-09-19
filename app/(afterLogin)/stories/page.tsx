"use client";

import { Suspense, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useInfiniteStories } from "@/hooks/useStories";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { EmptyState } from "@/components/stories";
import MailCard from "@/components/shareds/MailCard";
import { HeroBanner } from "@/components/home";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortOption } from "@/lib/api";

const CATEGORIES = ["카테고리", "가족", "사랑", "우정", "성장", "위로", "추억", "감사", "기타"];
const SORTS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
];

const bannerSlides = [{ id: 1, image: "/images/mainbanner/banner-1.png", alt: "배너 1" }];

const selectTriggerClass =
  "!h-[48px] sm:!h-[64px] min-w-[140px] sm:min-w-[160px] pl-4 sm:pl-5 pr-3 sm:pr-4 border-2 border-[#C4C4C4] rounded-lg bg-white text-[#424242] text-base sm:text-xl shadow-none data-[placeholder]:text-[#424242] data-[state=open]:border-[#FF7F65] focus-visible:border-[#FF7F65] focus-visible:ring-0 [&_svg]:size-5 [&_svg]:text-[#757575] [&_svg]:opacity-100";
const selectContentClass =
  "rounded-xl border-2 border-[#FFD1C7] bg-white shadow-[0_8px_24px_rgba(255,152,131,0.18)]";
const selectItemClass =
  "h-11 sm:h-12 pl-4 pr-10 rounded-lg text-base sm:text-lg text-[#424242] cursor-pointer focus:bg-[#FFF1EE] focus:text-[#FF7F65] data-[state=checked]:text-[#FF7F65] [&_svg]:text-[#FF7F65]";

function StoriesContent() {
  const { search, sort, category, updateFilter, resetFilter } = useStoriesFilter();
  const { stories, pagination, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteStories({ search, sort, category, limit: 20 });

  // 검색어는 제출 시에만 URL에 반영
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      {/* Banner */}
      <div className="container mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-12">
        <HeroBanner bannerSlides={bannerSlides} />
      </div>

      <main className="container mx-auto px-4 sm:px-8 lg:px-20 pb-16">
        {/* Title */}
        <div className="border-y border-[#C4C4C4] py-3 sm:py-4 mb-8 sm:mb-10">
          <h1
            className="text-2xl sm:text-4xl lg:text-[48px] text-[#757575]"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            사연 목록
          </h1>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <Select
            value={category || "all"}
            onValueChange={(v) => updateFilter({ category: v === "all" ? "" : v })}
          >
            <SelectTrigger className={selectTriggerClass} style={{ fontFamily: "Pretendard, sans-serif" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={6} className={selectContentClass}>
              {CATEGORIES.map((c) => (
                <SelectItem
                  key={c}
                  value={c === "카테고리" ? "all" : c}
                  className={selectItemClass}
                  style={{ fontFamily: "Pretendard, sans-serif" }}
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilter({ search: searchInput });
            }}
            className="flex-1 max-w-[360px]"
          >
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4C4C4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-[48px] sm:h-[64px] pl-12 pr-4 border-2 border-[#C4C4C4] rounded-lg text-base sm:text-xl text-[#424242] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF7F65]"
                style={{ fontFamily: "Pretendard, sans-serif" }}
              />
            </div>
          </form>

          <Select value={sort} onValueChange={(v) => updateFilter({ sort: v })}>
            <SelectTrigger className={selectTriggerClass} style={{ fontFamily: "Pretendard, sans-serif" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={6} className={selectContentClass}>
              {SORTS.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className={selectItemClass}
                  style={{ fontFamily: "Pretendard, sans-serif" }}
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link
            href="/story-update"
            className="h-[48px] sm:h-[64px] px-5 sm:px-6 border-2 border-[#C4C4C4] rounded-lg text-base sm:text-xl font-medium text-[#424242] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors whitespace-nowrap sm:ml-auto"
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            사연 작성
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <EmptyState onReset={resetFilter} />
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5">
              {stories.map((story, index) => (
                <MailCard key={story._id} item={story} index={index} />
              ))}
            </div>

            {/* 인피니티 스크롤 트리거 */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isFetchingNextPage ? (
                <div className="w-8 h-8 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
              ) : hasNextPage ? (
                <span className="text-[#C4C4C4]">스크롤하여 더 보기</span>
              ) : (
                <span className="text-[#C4C4C4]">총 {pagination?.total ?? stories.length}개의 사연</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FEFEFE] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StoriesContent />
    </Suspense>
  );
}
