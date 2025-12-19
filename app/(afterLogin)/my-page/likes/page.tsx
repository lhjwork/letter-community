"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useMyLikes } from "@/hooks/useMyLikes";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { StoryCard } from "@/components/stories";

export default function MyLikesPage() {
  const { stories, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMyLikes(20);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-page" className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">좋아요한 사연</h1>
        </div>

        {/* 콘텐츠 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">로딩 중...</p>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">좋아요한 사연이 없습니다</h3>
            <p className="text-gray-500 mb-6">마음에 드는 사연에 좋아요를 눌러보세요</p>
            <Link href="/stories" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              사연 둘러보기
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} />
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
                <span className="text-gray-400">모두 불러왔습니다 ✓</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
