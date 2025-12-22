"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useMyLikes } from "@/hooks/useMyLikes";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { StoryCard } from "@/components/stories";

export default function MyLikesPage() {
  const { stories, pagination, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMyLikes(20);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  const total = pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/my-page" className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
                좋아요한 사연
              </h1>
              <p className="text-gray-600">마음에 든 사연들을 모아보세요</p>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>
              총 <span className="font-semibold text-pink-600">{total}</span>개의 사연
            </span>
          </div>
        </div>
      </section>

      {/* 사연 목록 섹션 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">로딩 중...</p>
              </div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">좋아요한 사연이 없습니다</h3>
              <p className="text-gray-500 mb-6">마음에 드는 사연에 좋아요를 눌러보세요</p>
              <Link href="/stories" className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                사연 둘러보기
              </Link>
            </div>
          ) : (
            <>
              {/* Masonry 그리드 레이아웃 */}
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
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400">로딩 중...</span>
                  </div>
                ) : hasNextPage ? (
                  <span className="text-gray-400">스크롤하여 더 보기</span>
                ) : stories.length > 0 ? (
                  <span className="text-gray-400">모든 사연을 불러왔습니다 ✓</span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
