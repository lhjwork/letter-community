"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMyLetters } from "@/hooks/useMyLetters";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { LetterCard } from "@/components/letters";
import DraftList from "@/components/drafts/DraftList";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { letters, pagination, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useMyLetters(20);

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<"letters" | "drafts">("letters");

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  const handleLetterDelete = useCallback(
    (letterId: string) => {
      refetch(); // 삭제 후 목록 새로고침
    },
    [refetch]
  );

  // 임시저장 편집 핸들러
  const handleEditDraft = (draftId: string) => {
    router.push(`/write?draftId=${draftId}`);
  };

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const total = pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
                마이페이지
              </h1>
              <p className="text-gray-600">
                안녕하세요, <span className="font-semibold">{session?.user?.name}</span>님
              </p>
            </div>
            <Link href="/write" className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              새 편지 쓰기
            </Link>
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>
              총 <span className="font-semibold text-pink-600">{total}</span>개의 편지
            </span>
          </div>
        </div>
      </section>

      {/* 메뉴 섹션 */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex gap-4 mb-6">
            <Link href="/my-page/addresses" className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-colors">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">배송지 관리</span>
            </Link>
            <Link href="/my-page/likes" className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-colors">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">좋아요한 사연</span>
            </Link>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("letters")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "letters" ? "border-pink-500 text-pink-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              발행된 편지 ({total})
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "drafts" ? "border-pink-500 text-pink-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              임시저장
            </button>
          </div>
        </div>
      </section>

      {/* 컨텐츠 섹션 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {activeTab === "letters" ? (
            // 발행된 편지 목록
            letters.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 작성한 편지가 없습니다</h3>
                <p className="text-gray-500 mb-6">첫 번째 편지를 작성해보세요</p>
                <Link href="/write" className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                  편지 쓰기
                </Link>
              </div>
            ) : (
              <>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {letters.map((letter) => (
                    <div key={letter._id} className="break-inside-avoid mb-4">
                      <LetterCard letter={letter} onDelete={handleLetterDelete} />
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
                  ) : (
                    <span className="text-gray-400">모든 편지를 불러왔습니다 ✓</span>
                  )}
                </div>
              </>
            )
          ) : (
            // 임시저장 목록
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">임시저장된 편지</h3>
                  <p className="text-gray-600 text-sm">작성 중인 편지를 관리하고 계속 작성할 수 있습니다</p>
                </div>
                <Button onClick={() => router.push("/write")} className="bg-pink-500 hover:bg-pink-600">
                  새 편지 작성
                </Button>
              </div>
              <DraftList onEditDraft={handleEditDraft} />
            </div>
          )}
        </div>
      </section>

      {/* 계정 정보 섹션 */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              계정 정보
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-24">이름:</span>
                <span className="font-semibold">{session?.user?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-24">이메일:</span>
                <span className="font-semibold">{session?.user?.email || "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-24">로그인:</span>
                <span className="font-semibold capitalize">{(session as any)?.provider || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
