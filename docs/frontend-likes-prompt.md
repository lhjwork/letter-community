# 프론트엔드 개발자용 - 좋아요한 사연 기능 개선 프롬프트

## 🎯 목표

좋아요한 사연 페이지의 UI/UX를 개선하고, 통계 정보를 표시하여 사용자에게 더 풍부한 경험을 제공합니다. `/stories` 페이지와 일관된 디자인으로 통일성을 확보합니다.

## 📋 구현 요구사항

### 1. 좋아요 통계 훅 생성

**파일**: `hooks/useMyLikesStats.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface LikesStats {
  totalLikes: number;
  categories: {
    category: string;
    count: number;
    percentage: string;
  }[];
  recentActivity: {
    thisWeek: number;
    thisMonth: number;
  };
}

interface UseMyLikesStatsReturn {
  stats: LikesStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyLikesStats = (): UseMyLikesStatsReturn => {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [stats, setStats] = useState<LikesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/likes/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("통계를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      console.error("좋아요 통계 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const refetch = () => {
    fetchStats();
  };

  return { stats, isLoading, error, refetch };
};
```

### 2. 좋아요한 사연 페이지 완전 개선

**파일**: `app/(afterLogin)/my-page/likes/page.tsx`

```typescript
"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useMyLikes } from "@/hooks/useMyLikes";
import { useMyLikesStats } from "@/hooks/useMyLikesStats";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { StoryCard } from "@/components/stories";

export default function MyLikesPage() {
  const { stories, pagination, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMyLikes(20);
  const { stats, isLoading: statsLoading, error: statsError } = useMyLikesStats();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: "200px",
  });

  const total = pagination?.total || stats?.totalLikes || 0;

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
            {!statsLoading && stats && (
              <>
                <span>•</span>
                <span>
                  이번 주 <span className="font-semibold">{stats.recentActivity.thisWeek}</span>개
                </span>
                <span>•</span>
                <span>
                  이번 달 <span className="font-semibold">{stats.recentActivity.thisMonth}</span>개
                </span>
              </>
            )}
          </div>

          {/* 에러 표시 */}
          {statsError && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{statsError}</div>}
        </div>
      </section>

      {/* 카테고리 통계 섹션 */}
      {!statsLoading && stats && stats.categories.length > 0 && (
        <section className="bg-white py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리별 분포</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stats.categories.slice(0, 6).map((cat) => (
                <div key={cat.category} className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-full text-sm">
                  <span className="font-medium text-gray-800">{cat.category}</span>
                  <span className="ml-2 text-pink-600">{cat.count}개</span>
                  <span className="ml-1 text-gray-500">({cat.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
```

### 3. 마이페이지 메뉴 개선

**파일**: `app/(afterLogin)/my-page/page.tsx`의 메뉴 섹션 수정

기존 메뉴 섹션에서 좋아요한 사연 링크를 다음과 같이 개선:

```typescript
// useMyLikesStats 훅 import 추가
import { useMyLikesStats } from "@/hooks/useMyLikesStats";

// 컴포넌트 내부에서 통계 데이터 가져오기
export default function MyPage() {
  // ... 기존 코드 ...
  const { stats: likesStats, isLoading: likesStatsLoading } = useMyLikesStats();

  // ... 기존 코드 ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... 기존 헤더 섹션 ... */}

      {/* 메뉴 섹션 개선 */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 배송지 관리 */}
            <Link href="/my-page/addresses" className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-colors">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">배송지 관리</span>
                <p className="text-xs text-gray-500">배송지 추가, 수정, 삭제</p>
              </div>
            </Link>

            {/* 좋아요한 사연 - 개선된 버전 */}
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
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">좋아요한 사연</span>
                {!likesStatsLoading && likesStats ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{likesStats.totalLikes}개</span>
                    {likesStats.recentActivity.thisWeek > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-pink-600">이번 주 +{likesStats.recentActivity.thisWeek}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">마음에 든 사연 모음</p>
                )}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ... 나머지 기존 코드 ... */}
    </div>
  );
}
```

## 🎨 디자인 가이드라인

### 1. 색상 팔레트

- **Primary**: Pink-500 (#EC4899)
- **Secondary**: Purple-500 (#8B5CF6)
- **Background**: Gray-50 (#F9FAFB)
- **Text**: Gray-800 (#1F2937)
- **Muted**: Gray-500 (#6B7280)

### 2. 레이아웃 일관성

- `/stories` 페이지와 동일한 섹션 구조 사용
- Masonry 그리드 레이아웃 (`columns-1 sm:columns-2 lg:columns-3 xl:columns-4`)
- 동일한 헤더, 통계, 콘텐츠 섹션 패턴

### 3. 반응형 디자인

- **Mobile**: 1열 그리드
- **Tablet**: 2열 그리드
- **Desktop**: 3-4열 그리드
- 통계 정보는 모바일에서 세로 배치

## 🧪 테스트 시나리오

### 1. 정상 케이스

- 좋아요한 사연이 있는 사용자
- 통계 정보 정상 표시
- 인피니티 스크롤 동작

### 2. 빈 상태

- 좋아요한 사연이 없는 사용자
- 적절한 빈 상태 메시지 표시
- 사연 둘러보기 버튼 동작

### 3. 로딩 상태

- 초기 로딩 스피너 표시
- 추가 로딩 시 하단 로딩 표시
- 통계 로딩 중 스켈레톤 UI

### 4. 에러 상태

- 네트워크 에러 처리
- API 에러 메시지 표시
- 재시도 기능

## 📱 모바일 최적화

### 1. 터치 친화적 UI

- 버튼 최소 크기 44px
- 적절한 터치 영역 간격
- 스와이프 제스처 지원

### 2. 성능 최적화

- 이미지 lazy loading
- 컴포넌트 메모이제이션
- 불필요한 리렌더링 방지

## 📋 완료 체크리스트

### 훅 구현

- [ ] `useMyLikesStats` 훅 생성
- [ ] 에러 처리 및 로딩 상태 관리
- [ ] 타입 정의 완료

### 페이지 개선

- [ ] 좋아요한 사연 페이지 레이아웃 개선
- [ ] 통계 정보 표시 구현
- [ ] 카테고리 분포 표시
- [ ] Masonry 그리드 적용
- [ ] 인피니티 스크롤 유지

### 마이페이지 연동

- [ ] 메뉴에 통계 정보 표시
- [ ] 로딩 상태 처리
- [ ] 반응형 디자인 적용

### 테스트 및 최적화

- [ ] 다양한 시나리오 테스트
- [ ] 성능 최적화 적용
- [ ] 접근성 개선
- [ ] 모바일 최적화

## 🚀 추가 개선 아이디어

1. **애니메이션**: 통계 숫자 카운트업 애니메이션
2. **차트**: 카테고리 분포를 도넛 차트로 시각화
3. **필터링**: 카테고리별 필터링 기능
4. **정렬**: 좋아요 누른 순서, 인기순 정렬
5. **공유**: 좋아요한 사연 목록 공유 기능
