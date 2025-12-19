"use client";

import { Suspense, useCallback } from "react";
import Link from "next/link";
import { useInfiniteStories } from "@/hooks/useStories";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { CategoryFilter, SearchBar, SortSelect, StoryCard, EmptyState } from "@/components/stories";
import type { SortOption } from "@/lib/api";

function StoriesContent() {
  const { search, sort, category, updateFilter, resetFilter } = useStoriesFilter();
  const { stories, pagination, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteStories({ search, sort, category, limit: 20 });

  // 다음 페이지 로드 함수
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Intersection Observer로 스크롤 감지
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  const total = pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 캐러셀 영역 (더미) */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-gray-100 rounded-lg h-48 md:h-64 flex items-center justify-center">
            <p className="text-gray-400 text-lg">캐러셀 영역 (추후 구현)</p>
          </div>
        </div>
      </section>

      {/* 검색 및 필터 섹션 */}
      <section className="bg-white py-6 border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* 검색바 */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 max-w-md w-full">
              <SearchBar value={search} onChange={(value) => updateFilter({ search: value })} />
            </div>

            {/* 사연 작성 버튼 */}
            <Link href="/write" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              사연 작성
            </Link>
          </div>

          {/* 카테고리 필터 버튼 */}
          <CategoryFilter selected={category} onChange={(value) => updateFilter({ category: value })} />

          {/* 결과 수 & 정렬 */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600">
              총 <span className="font-semibold text-primary">{total}</span>개의 사연
            </span>
            <SortSelect value={sort as SortOption} onChange={(value) => updateFilter({ sort: value })} />
          </div>
        </div>
      </section>

      {/* Masonry 그리드 레이아웃 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">로딩 중...</p>
              </div>
            </div>
          ) : stories.length === 0 ? (
            <EmptyState onReset={resetFilter} />
          ) : (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {stories.map((story) => (
                  <div key={story._id} className="break-inside-avoid mb-4">
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>

              {/* 인피니티 스크롤 트리거 */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400">로딩 중...</span>
                  </div>
                ) : hasNextPage ? (
                  <span className="text-gray-400">스크롤하여 더 보기</span>
                ) : (
                  <span className="text-gray-400">모든 사연을 불러왔습니다 ✓</span>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">로딩 중...</p>
          </div>
        </div>
      }
    >
      <StoriesContent />
    </Suspense>
  );
}
