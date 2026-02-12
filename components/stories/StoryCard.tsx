"use client";

import Link from "next/link";
import { LikeButton } from "@/components/like";
import type { Story } from "@/lib/api";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  // 안전한 텍스트 추출 함수
  const getPreviewText = (htmlContent?: string) => {
    if (!htmlContent) return "내용이 없습니다.";
    const text = htmlContent.replace(/<[^>]*>/g, "");
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  return (
    <Link href={`/letter/${story._id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group p-6">
        {/* 카테고리 아이콘 */}
        {story.category && (
          <div className="mb-4">
            <span className="text-2xl">
              {story.category === "가족" && "👨‍👩‍👧‍👦"}
              {story.category === "사랑" && "💕"}
              {story.category === "우정" && "💛"}
              {story.category === "성장" && "🌱"}
              {story.category === "위로" && "🫂"}
              {story.category === "추억" && "📷"}
              {story.category === "감사" && "⚠️"}
              {story.category === "기타" && "📝"}
            </span>
          </div>
        )}

        {/* 본문 미리보기 - 여러 줄 */}
        <div className="mb-16 min-h-[120px]">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {getPreviewText(story.content)}
          </p>
        </div>

        {/* 푸터 - 작성자 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {story.authorName || "익명"}
          </span>
          <span className="text-xs text-gray-400">
            {story.createdAt
              ? new Date(story.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "날짜 없음"}
          </span>
        </div>
      </div>
    </Link>
  );
}
