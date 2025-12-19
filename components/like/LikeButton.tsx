"use client";

import { useState } from "react";
import { useLike } from "@/hooks/useLike";
import LoginDialog from "@/components/shareds/LoginDialog";

interface LikeButtonProps {
  letterId: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function LikeButton({ letterId, initialLikeCount = 0, initialIsLiked = false, size = "md", showCount = true }: LikeButtonProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { isLiked, likeCount, isToggling, toggleLike, isLoggedIn } = useLike({
    letterId,
    initialLikeCount,
    initialIsLiked,
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      return;
    }

    await toggleLike();
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={`
          flex items-center gap-1 transition-all duration-200
          ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}
          ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${sizeClasses[size]}
        `}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <svg className={`${iconSizes[size]} transition-transform ${isToggling ? "scale-90" : "hover:scale-110"}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {showCount && <span>{likeCount}</span>}
      </button>

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  );
}
