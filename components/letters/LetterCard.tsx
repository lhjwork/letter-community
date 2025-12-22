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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPreviewText = (htmlContent: string) => {
    const text = htmlContent.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-6">
        <Link href={`/letter/${letter._id}`} className="group">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">{letter.title}</h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{getPreviewText(letter.content)}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>작성자: {letter.authorName}</span>
          <span>{formatDate(letter.createdAt)}</span>
        </div>

        <div className="flex gap-2">
          <Link href={`/letter/${letter._id}`} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm text-center">
            보기
          </Link>
          <Link href={`/letter/${letter._id}/custom-og`} className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm text-center">
            OG 편집
          </Link>
          <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50">
            {isDeleting ? "삭제중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
