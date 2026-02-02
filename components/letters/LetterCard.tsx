"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteLetter, type Letter } from "@/lib/api";
import { useSession } from "next-auth/react";

interface LetterCardProps {
  letter: Letter;
  onDelete?: (letterId: string) => void;
}

export function LetterCard({ letter, onDelete }: LetterCardProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 편지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = session?.backendToken as string;
      await deleteLetter(letter._id, token);
      onDelete?.(letter._id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "편지 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundImage: `repeating-linear-gradient(
          transparent,
          transparent 27px,
          #e5e7eb 27px,
          #e5e7eb 28px
        )`,
        backgroundSize: "100% 28px",
      }}
    >
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* 하트 이모지 (임시) */}
          <span className="text-lg">❤️</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(letter.createdAt)}
        </div>
      </div>

      {/* 편지 내용 영역 */}
      <div className="p-4 pt-6">
        {/* 편지 내용 미리보기 */}
        <div
          className="text-gray-700 text-sm leading-7"
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            lineHeight: "28px",
          }}
        >
          {letter.content.replace(/<[^>]*>/g, "").substring(0, 150)}
          {letter.content.replace(/<[^>]*>/g, "").length > 150 && "..."}
        </div>
      </div>

      {/* 하단 서명 */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        닉네임
      </div>

      {/* 호버 시 나타나는 액션 버튼들 */}
      <div
        className={`absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center gap-4 transition-all duration-300 ease-in-out ${
          isHovered ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <Link
          href={`/letter/${letter._id}`}
          className={`px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium shadow-lg transform ${
            isHovered ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
          }`}
          style={{ transitionDelay: isHovered ? "100ms" : "0ms" }}
        >
          보기
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 cursor-pointer transform ${
            isHovered ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
          }`}
          style={{ transitionDelay: isHovered ? "150ms" : "0ms" }}
        >
          {isDeleting ? "삭제중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}
