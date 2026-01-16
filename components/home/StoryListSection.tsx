"use client";

import Link from "next/link";
import type { Story } from "@/lib/api";

interface StoryCardProps {
  story: Story;
}

function StoryCard({ story }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // HTML 태그 제거하고 텍스트만 추출
  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 50);
  };

  return (
    <Link href={`/letter/${story._id}`}>
      <div className="bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl p-8 w-full h-[312px] relative hover:shadow-lg transition-shadow cursor-pointer">
        {/* 가로 줄들 */}
        <div className="space-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-px bg-[#EDEDED]" />
          ))}
        </div>

        {/* 날짜 */}
        <div className="absolute top-8 right-8">
          <span className="text-lg text-[#424242]">{formatDate(story.createdAt)}</span>
        </div>

        {/* 카테고리 배지 */}
        {story.category && (
          <div className="absolute top-8 left-8">
            <span className="px-3 py-1 bg-[#FF7F65] text-white text-sm rounded-full">{getCategoryLabel(story.category)}</span>
          </div>
        )}

        {/* 제목 또는 내용 미리보기 */}
        <div className="absolute top-20 left-8 right-8">
          <p className="text-base text-[#424242] line-clamp-3">{story.title || getPlainText(story.content || "")}</p>
        </div>

        {/* 작성자 */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2">
          <span className="text-xl font-medium text-[#424242]">{story.authorName || "익명"}</span>
        </div>

        {/* 통계 정보 */}
        {(story.viewCount || story.likeCount) && (
          <div className="absolute bottom-8 left-8 flex items-center gap-3 text-sm text-[#757575]">
            {story.viewCount !== undefined && <span>👁 {story.viewCount}</span>}
            {story.likeCount !== undefined && <span>❤️ {story.likeCount}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

// 카테고리 한글 라벨 (백엔드에서 이미 한글로 반환)
function getCategoryLabel(category: string): string {
  // 백엔드 API가 한글로 반환: 가족, 사랑, 우정, 성장, 위로, 추억, 감사, 기타
  // 영문 카테고리가 올 경우를 대비한 매핑
  const labels: Record<string, string> = {
    friendship: "우정",
    love: "사랑",
    family: "가족",
    gratitude: "감사",
    apology: "사과",
    encouragement: "응원",
    memory: "추억",
    growth: "성장",
    comfort: "위로",
    other: "기타",
    // 한글 카테고리는 그대로 반환
    우정: "우정",
    사랑: "사랑",
    가족: "가족",
    감사: "감사",
    성장: "성장",
    위로: "위로",
    추억: "추억",
    기타: "기타",
  };
  return labels[category] || category;
}

interface StoryListSectionProps {
  stories: Story[];
}

export default function StoryListSection({ stories }: StoryListSectionProps) {
  // 4개로 제한 (백엔드에서 이미 4개만 보내지만 안전장치)
  const displayStories = stories.slice(0, 4);

  // 4개 미만이면 빈 카드로 채우기
  const emptyCards = 4 - displayStories.length;

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-20">
        {/* 타이틀 */}
        <div className="text-center mb-16">
          <h2 className="text-[52px] leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-4">사연을 남겨주세요</h2>
          <p className="text-2xl text-[#757575]">당신의 이야기가 한장의 편지로 이어집니다</p>
        </div>

        {/* 스토리 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
          {displayStories.map((story) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center">
          <Link href="/stories" className="px-8 py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors">
            더 많은 사연 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
