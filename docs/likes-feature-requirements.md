# 좋아요한 사연 기능 개선 요구사항

## 현재 상황 분석

### 이미 구현된 부분

- ✅ `/my-page/likes` 페이지 구현됨
- ✅ `useMyLikes` 훅 구현됨
- ✅ 인피니티 스크롤 지원
- ✅ 백엔드 API (`/api/users/me/likes`) 구현됨

### 개선이 필요한 부분

- 🔧 마이페이지에서 좋아요한 사연 메뉴 연결 개선
- 🔧 UI/UX 일관성 향상 (stories 페이지와 동일한 레이아웃)
- 🔧 통계 정보 표시 개선

---

## Backend 개선 요구사항

### 1. 좋아요 통계 API 추가

**새로운 엔드포인트**: `GET /api/users/me/likes/stats`

#### 응답 형식

```json
{
  "success": true,
  "data": {
    "totalLikes": 25,
    "categories": [
      {
        "category": "일상",
        "count": 10,
        "percentage": "40%"
      },
      {
        "category": "연애",
        "count": 8,
        "percentage": "32%"
      },
      {
        "category": "가족",
        "count": 7,
        "percentage": "28%"
      }
    ],
    "recentActivity": {
      "thisWeek": 3,
      "thisMonth": 12
    }
  }
}
```

#### 구현 예시 (Node.js/Express + MongoDB)

```javascript
// GET /api/users/me/likes/stats
app.get("/api/users/me/likes/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 총 좋아요 수
    const totalLikes = await Like.countDocuments({ userId });

    // 카테고리별 통계
    const categoryStats = await Like.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "letters",
          localField: "letterId",
          foreignField: "_id",
          as: "letter",
        },
      },
      { $unwind: "$letter" },
      {
        $group: {
          _id: "$letter.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 퍼센티지 계산
    const categories = categoryStats.map((stat) => ({
      category: stat._id || "기타",
      count: stat.count,
      percentage: totalLikes > 0 ? `${Math.round((stat.count / totalLikes) * 100)}%` : "0%",
    }));

    // 최근 활동 통계
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const thisWeek = await Like.countDocuments({
      userId,
      createdAt: { $gte: oneWeekAgo },
    });

    const thisMonth = await Like.countDocuments({
      userId,
      createdAt: { $gte: oneMonthAgo },
    });

    res.json({
      success: true,
      data: {
        totalLikes,
        categories,
        recentActivity: {
          thisWeek,
          thisMonth,
        },
      },
    });
  } catch (error) {
    console.error("좋아요 통계 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "통계를 불러오는데 실패했습니다.",
    });
  }
});
```

### 2. 기존 API 개선 (선택사항)

**`GET /api/users/me/likes` 개선**

- 카테고리 필터링 지원
- 정렬 옵션 추가

#### 추가 쿼리 파라미터

```
- category: string (선택) - 카테고리 필터
- sort: 'latest' | 'oldest' | 'popular' (선택, 기본값: 'latest')
```

---

## Frontend 개선 요구사항

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

export const useMyLikesStats = () => {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [stats, setStats] = useState<LikesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/likes/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error("통계 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return { stats, isLoading };
};
```

### 2. 좋아요한 사연 페이지 개선

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
  const { stats, isLoading: statsLoading } = useMyLikesStats();

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

          {/* 통계 */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>
              총 <span className="font-semibold text-pink-600">{total}</span>개의 사연
            </span>
            {!statsLoading && stats && (
              <>
                <span>•</span>
                <span>이번 주 {stats.recentActivity.thisWeek}개</span>
                <span>•</span>
                <span>이번 달 {stats.recentActivity.thisMonth}개</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리 통계 (선택사항) */}
      {!statsLoading && stats && stats.categories.length > 0 && (
        <section className="bg-white py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex gap-4 overflow-x-auto">
              {stats.categories.slice(0, 5).map((cat) => (
                <div key={cat.category} className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="ml-2 text-gray-500">
                    {cat.count}개 ({cat.percentage})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 사연 목록 */}
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
```

### 3. 마이페이지 메뉴 개선

마이페이지의 "좋아요한 사연" 메뉴에 통계 정보 표시:

```typescript
// app/(afterLogin)/my-page/page.tsx 의 메뉴 섹션에 추가
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
    <span className="text-sm font-medium">좋아요한 사연</span>
    {!statsLoading && stats && <p className="text-xs text-gray-500">{stats.totalLikes}개</p>}
  </div>
</Link>
```

---

## 완료 확인 체크리스트

### Backend

- [ ] 좋아요 통계 API 구현 (`/api/users/me/likes/stats`)
- [ ] 카테고리별 통계 집계 로직 구현
- [ ] 최근 활동 통계 구현
- [ ] 에러 처리 및 예외 상황 대응
- [ ] API 문서 업데이트

### Frontend

- [ ] `useMyLikesStats` 훅 구현
- [ ] 좋아요한 사연 페이지 UI 개선
- [ ] 마이페이지 메뉴에 통계 정보 표시
- [ ] 로딩 상태 및 에러 처리
- [ ] 반응형 디자인 적용

---

## 추가 개선 아이디어

1. **필터링 기능**: 카테고리별로 좋아요한 사연 필터링
2. **정렬 옵션**: 최신순, 인기순, 좋아요 누른 순서대로 정렬
3. **검색 기능**: 좋아요한 사연 내에서 검색
4. **내보내기**: 좋아요한 사연 목록을 PDF나 텍스트로 내보내기
5. **추천 시스템**: 좋아요 패턴 기반 사연 추천
