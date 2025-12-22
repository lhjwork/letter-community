"use client";

import Link from "next/link";
import { getCategoryTheme } from "@/lib/categoryTheme";
import { LikeButton } from "@/components/like";
import type { Story } from "@/lib/api";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const theme = getCategoryTheme(story.category || "기타");

  // 안전한 텍스트 추출 함수
  const getPreviewText = (htmlContent?: string) => {
    if (!htmlContent) return "내용이 없습니다.";
    const text = htmlContent.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  return (
    <Link href={`/letter/${story._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group p-6">
        {/* 카테고리 뱃지 */}
        {story.category && (
          <span
            className={`
              inline-flex items-center gap-1 px-3 py-1 rounded-full 
              text-xs font-medium mb-3
              ${theme.color}
            `}
          >
            {theme.emoji} {story.category}
          </span>
        )}

        {/* 제목 */}
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors mb-2">{story.title || "제목 없음"}</h3>

        {/* 작성자 */}
        <p className="text-sm text-gray-500 mb-3">{story.authorName || "익명"}</p>

        {/* 본문 미리보기 */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{getPreviewText(story.content)}</p>

        {/* 푸터 */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {story.viewCount || 0}
            </span>
            <LikeButton letterId={story._id} initialLikeCount={story.likeCount || 0} size="sm" showCount />
          </div>
          <span>{story.createdAt ? new Date(story.createdAt).toLocaleDateString("ko-KR") : "날짜 없음"}</span>
        </div>
      </div>
    </Link>
  );
}
