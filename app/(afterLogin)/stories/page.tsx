"use client";

import { useState, useEffect } from "react";
import { getStories, type Letter } from "@/lib/api";
import { getCategoryTheme } from "@/lib/categoryTheme";
import Link from "next/link";
import Image from "next/image";

// 카테고리 목록
const categories = ["전체보기", "가족", "사랑", "우정", "성장", "위로", "추억", "감사", "기타"];

export default function StoriesPage() {
  const [stories, setStories] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체보기");

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const response = await getStories({ limit: 20 });
      setStories(response.data);
    } catch (error) {
      console.error("사연 목록 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 필터 핸들러
  const handleCategoryFilter = async (category: string) => {
    setCategoryFilter(category);
    // TODO: 백엔드에 category 파라미터 추가 후 연동
    // try {
    //   const response = await getStories({
    //     limit: 20,
    //     category: category === "전체보기" ? undefined : category,
    //   });
    //   setStories(response.data);
    // } catch (error) {
    //   console.error("필터링 실패:", error);
    // }
  };

  // 더미 데이터 (백엔드 연결 전까지)
  const dummyStories: Letter[] = [
    {
      _id: "1",
      title: "첫사랑에게 보내는 편지",
      content: "오랜만이야. 잘 지내고 있니? 나는 요즘 너를 많이 생각해. 그때 우리가 함께했던 시간들이 참 소중했어...",
      authorName: "익명",
      createdAt: new Date().toISOString(),
      category: "사랑",
    },
    {
      _id: "2",
      title: "엄마에게",
      content: "엄마, 항상 고마워요. 말로 표현하지 못했지만 엄마가 해주신 모든 것들이 제 삶의 힘이 되고 있어요. 사랑해요.",
      authorName: "딸",
      createdAt: new Date().toISOString(),
      category: "가족",
    },
    {
      _id: "3",
      title: "나 자신에게",
      content: "힘들었지? 정말 수고했어. 앞으로도 잘 해낼 수 있을 거야. 너는 충분히 잘하고 있어.",
      authorName: "미래의 나",
      createdAt: new Date().toISOString(),
      category: "성장",
    },
    {
      _id: "4",
      title: "떠나간 친구에게",
      content: "네가 없는 세상은 참 허전해. 하지만 너와 함께했던 추억들은 영원히 내 마음속에 남아있을 거야. 고마웠어.",
      authorName: "친구",
      createdAt: new Date().toISOString(),
      category: "추억",
    },
    {
      _id: "5",
      title: "미래의 나에게",
      content: "지금의 선택이 옳은지 모르겠지만, 최선을 다하고 있어. 미래의 나는 지금의 나를 자랑스러워할 수 있을까?",
      authorName: "현재의 나",
      createdAt: new Date().toISOString(),
      category: "성장",
    },
    {
      _id: "6",
      title: "할머니께",
      content: "할머니, 보고 싶어요. 할머니가 만들어주시던 음식 맛이 아직도 생생해요. 천국에서 편히 쉬세요.",
      authorName: "손녀",
      createdAt: new Date().toISOString(),
      category: "가족",
    },
    {
      _id: "7",
      title: "선생님께 감사의 편지",
      content: "선생님 덕분에 제 인생이 바뀌었습니다. 포기하지 않고 믿어주셔서 감사합니다.",
      authorName: "제자",
      createdAt: new Date().toISOString(),
      category: "감사",
    },
    {
      _id: "8",
      title: "반려동물에게",
      content: "너와 함께한 시간들이 내 인생에서 가장 행복한 순간이었어. 무지개다리 건너편에서도 행복하길.",
      authorName: "집사",
      createdAt: new Date().toISOString(),
      category: "추억",
    },
  ];

  const displayStories = stories.length > 0 ? stories : dummyStories;

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
          {/* 카테고리 필터 버튼 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => {
              const theme = getCategoryTheme(cat);
              const isActive = categoryFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilter(cat)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                    transition-all duration-200
                    ${isActive ? theme.color + " shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"}
                  `}
                >
                  {cat !== "전체보기" && theme.emoji} {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 검색 바 */}
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 사연 작성 버튼 */}
            <Link href="/write" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              사연 작성
            </Link>
          </div>
        </div>
      </section>

      {/* Masonry 그리드 레이아웃 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-400">로딩 중...</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {displayStories.map((story, index) => (
                <Link key={story._id} href={`/letter/${story._id}`} className="break-inside-avoid block mb-4">
                  <div
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
                    style={{
                      height: `${200 + (index % 3) * 100}px`,
                    }}
                  >
                    <div className="p-6 h-full flex flex-col">
                      {/* 카드 헤더 */}
                      <div className="mb-4">
                        {/* 카테고리 뱃지 */}
                        {story.category && (
                          <span
                            className={`
                              inline-flex items-center gap-1 px-3 py-1 rounded-full 
                              text-xs font-medium mb-2
                              ${getCategoryTheme(story.category).color}
                            `}
                          >
                            {getCategoryTheme(story.category).emoji}
                            {story.category}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{story.authorName}</p>
                      </div>

                      {/* 카드 본문 */}
                      <p className="text-gray-600 text-sm line-clamp-4 flex-1">{story.content}</p>

                      {/* 카드 푸터 */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{new Date(story.createdAt).toLocaleDateString("ko-KR")}</span>
                        <span className="text-primary text-sm group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
