"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMyLetters } from "@/hooks/useMyLetters";
import { useInfiniteStories } from "@/hooks/useStories";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { LetterCard } from "@/components/letters";
import { CategoryFilter, StoryCard } from "@/components/stories";
import { HeroBanner } from "@/components/home";
import AdCarousel from "@/components/ads/AdCarousel";

export default function MyPage() {
  const { status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"letters" | "stories">("letters");

  // 정적 배너 데이터
  const bannerSlides = [
    {
      id: 1,
      image: "/images/mainbanner/banner-1.png",
      alt: "배너 1",
    },
  ];

  // 내 편지 관련 훅
  const {
    letters,
    pagination: letterPagination,
    isLoading: isLettersLoading,
    isFetchingNextPage: isLettersFetching,
    hasNextPage: hasLettersNextPage,
    fetchNextPage: fetchLettersNextPage,
    refetch: refetchLetters,
  } = useMyLetters(20);

  // 사연 관련 훅
  const { search, sort, category, updateFilter } = useStoriesFilter();
  const {
    stories,
    pagination: storiesPagination,
    isLoading: isStoriesLoading,
    isFetchingNextPage: isStoriesFetching,
    hasNextPage: hasStoriesNextPage,
    fetchNextPage: fetchStoriesNextPage,
  } = useInfiniteStories({ search, sort, category, limit: 20 });

  // 내 편지 무한 스크롤
  const loadMoreLetters = useCallback(() => {
    if (hasLettersNextPage && !isLettersFetching) {
      fetchLettersNextPage();
    }
  }, [hasLettersNextPage, isLettersFetching, fetchLettersNextPage]);

  const { ref: lettersLoadMoreRef } = useIntersectionObserver({
    onIntersect: loadMoreLetters,
    rootMargin: "200px",
  });

  // 사연 무한 스크롤
  const loadMoreStories = useCallback(() => {
    if (hasStoriesNextPage && !isStoriesFetching) {
      fetchStoriesNextPage();
    }
  }, [hasStoriesNextPage, isStoriesFetching, fetchStoriesNextPage]);

  const { ref: storiesLoadMoreRef } = useIntersectionObserver({
    onIntersect: loadMoreStories,
    rootMargin: "200px",
  });

  const handleLetterDelete = useCallback(() => {
    refetchLetters();
  }, [refetchLetters]);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 검색 필터링된 편지들
  const filteredLetters = letters.filter(
    (letter) =>
      letter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 사연 검색 필터링
  const filteredStories = stories.filter(
    (story) =>
      story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.content &&
        story.content.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 베너 */}
      {bannerSlides.length > 0 && (
        <div className="container mx-auto px-20 py-12">
          <HeroBanner bannerSlides={bannerSlides} />
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("letters")}
              className={`text-3xl font-bold pb-2 border-b-2 transition-colors ${
                activeTab === "letters"
                  ? "text-gray-800 border-gray-800"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              내 편지
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`text-3xl font-bold pb-2 border-b-2 transition-colors ${
                activeTab === "stories"
                  ? "text-gray-800 border-gray-800"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              사연 모아보기
            </button>
          </div>
        </div>

        {/* 검색바와 작성 버튼 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9883] focus:border-transparent"
              />
            </div>
          </div>
          <Link
            href="/write"
            className="px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium whitespace-nowrap"
          >
            {activeTab === "letters" ? "편지 작성" : "사연 작성"}
          </Link>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === "letters" ? (
          // 편지 목록
          <>
            {/* 빠른 액션 버튼들 */}
            {/* <div className="flex justify-center gap-4 mb-8">
              <Link
                href="/my-page/addresses"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#FF9883] hover:bg-orange-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#FF9883]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-medium">배송지 관리</span>
              </Link>
              <Link
                href="/my-page/likes"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#FF9883] hover:bg-orange-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#FF9883]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm font-medium">좋아요한 사연</span>
              </Link>
            </div> */}

            {isLettersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-[#FF9883] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400">로딩 중...</p>
                </div>
              </div>
            ) : filteredLetters.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "아직 작성한 편지가 없습니다"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : "첫 번째 편지를 작성해보세요"}
                </p>
                {!searchQuery && (
                  <Link
                    href="/write"
                    className="px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    편지 쓰기
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {filteredLetters.map((letter) => (
                    <div key={letter._id} className="break-inside-avoid mb-4">
                      <LetterCard
                        letter={letter}
                        onDelete={handleLetterDelete}
                      />
                    </div>
                  ))}
                </div>

                {/* 무한 스크롤 로더 - 검색 중이 아닐 때만 표시 */}
                {!searchQuery && (
                  <div
                    ref={lettersLoadMoreRef}
                    className="py-8 flex justify-center"
                  >
                    {isLettersFetching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#FF9883] border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400">로딩 중...</span>
                      </div>
                    ) : hasLettersNextPage ? (
                      <span className="text-gray-400">스크롤하여 더 보기</span>
                    ) : (
                      <span className="text-gray-400">
                        모든 편지를 불러왔습니다 ✓
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // 사연 목록
          <>
            {/* 검색 및 필터 섹션 */}
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
              <CategoryFilter
                selected={category}
                onChange={(value) => updateFilter({ category: value })}
              />

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <span className="text-gray-600">
                  총{" "}
                  <span className="font-semibold text-[#FF9883]">
                    {storiesPagination?.total || 0}
                  </span>
                  개의 사연
                </span>
              </div>
            </div>

            {isStoriesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-[#FF9883] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400">로딩 중...</p>
                </div>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery ? "검색 결과가 없습니다" : "사연이 없습니다"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : "첫 번째 사연을 작성해보세요"}
                </p>
                {!searchQuery && (
                  <Link
                    href="/write"
                    className="px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    사연 쓰기
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {filteredStories.map((story, index) => (
                    <div key={story._id} className="break-inside-avoid mb-4">
                      <StoryCard story={story} />
                      {(index + 1) % 20 === 0 && (
                        <div className="mb-4 col-span-full">
                          <AdCarousel
                            placement="banner"
                            limit={2}
                            aspectRatio="16:9"
                            autoPlay={true}
                            autoPlayInterval={7000}
                            showControls={false}
                            showIndicators={true}
                            showDebugInfo={
                              process.env.NODE_ENV === "development"
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 무한 스크롤 로더 - 검색 중이 아닐 때만 표시 */}
                {!searchQuery && (
                  <div
                    ref={storiesLoadMoreRef}
                    className="py-8 flex justify-center"
                  >
                    {isStoriesFetching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#FF9883] border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400">로딩 중...</span>
                      </div>
                    ) : hasStoriesNextPage ? (
                      <span className="text-gray-400">스크롤하여 더 보기</span>
                    ) : (
                      <span className="text-gray-400">
                        모든 사연을 불러왔습니다 ✓
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 페이지네이션 */}
        {((activeTab === "letters" &&
          letterPagination &&
          letterPagination.totalPages > 1) ||
          (activeTab === "stories" &&
            storiesPagination &&
            storiesPagination.totalPages > 1)) && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => {
                /* 이전 페이지 로직 */
              }}
              disabled={
                activeTab === "letters"
                  ? letterPagination?.page === 1
                  : storiesPagination?.page === 1
              }
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ‹
            </button>

            {Array.from(
              {
                length: Math.min(
                  5,
                  activeTab === "letters"
                    ? letterPagination?.totalPages || 0
                    : storiesPagination?.totalPages || 0,
                ),
              },
              (_, i) => {
                const pageNum = i + 1;
                const currentPage =
                  activeTab === "letters"
                    ? letterPagination?.page
                    : storiesPagination?.page;

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      /* 페이지 이동 로직 */
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-[#FF9883] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            <button
              onClick={() => {
                /* 다음 페이지 로직 */
              }}
              disabled={
                activeTab === "letters"
                  ? letterPagination?.page === letterPagination?.totalPages
                  : storiesPagination?.page === storiesPagination?.totalPages
              }
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
