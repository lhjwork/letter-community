"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleTap = () => {
    setIsHovered((prev) => !prev);
  };

  return (
    <motion.div
      className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        rotateY: 2,
        rotateX: -1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        backgroundImage: `repeating-linear-gradient(
          transparent,
          transparent 27px,
          #e5e7eb 27px,
          #e5e7eb 28px
        )`,
        backgroundSize: "100% 28px",
        perspective: 800,
      }}
    >
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-lg"
            animate={isHovered ? { rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            ❤️
          </motion.span>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(letter.createdAt)}
        </div>
      </div>

      {/* 편지 내용 영역 */}
      <div className="p-4 pt-6">
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
      <motion.div
        className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-4"
        initial={false}
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isHovered ? "auto" : "none" }}
      >
        <motion.div
          initial={false}
          animate={isHovered ? { y: 0, scale: 1, opacity: 1 } : { y: 10, scale: 0.95, opacity: 0 }}
          transition={{ delay: isHovered ? 0.05 : 0, duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link
            href={`/letter/${letter._id}`}
            className="px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg inline-block"
          >
            보기
          </Link>
        </motion.div>
        <motion.div
          initial={false}
          animate={isHovered ? { y: 0, scale: 1, opacity: 1 } : { y: 10, scale: 0.95, opacity: 0 }}
          transition={{ delay: isHovered ? 0.1 : 0, duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
        >
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "삭제중..." : "삭제"}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
