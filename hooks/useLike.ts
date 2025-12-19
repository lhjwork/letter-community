"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { addLike, removeLike, checkLikeStatus } from "@/lib/api";

interface UseLikeOptions {
  letterId: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
}

export const useLike = ({ letterId, initialLikeCount = 0, initialIsLiked = false }: UseLikeOptions) => {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 로그인 상태에서 좋아요 상태 확인
  useEffect(() => {
    if (!token || !letterId) return;

    const fetchLikeStatus = async () => {
      try {
        setIsLoading(true);
        const response = await checkLikeStatus(letterId, token);
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.likeCount);
      } catch (error) {
        console.error("좋아요 상태 확인 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [letterId, token]);

  const toggleLike = useCallback(async () => {
    if (!token || isToggling) return false;

    setIsToggling(true);

    // 낙관적 업데이트
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? Math.max(likeCount - 1, 0) : likeCount + 1);

    try {
      if (previousIsLiked) {
        await removeLike(letterId, token);
      } else {
        await addLike(letterId, token);
      }
      return true;
    } catch (error) {
      // 에러 시 롤백
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error("좋아요 토글 실패:", error);
      return false;
    } finally {
      setIsToggling(false);
    }
  }, [letterId, token, isLiked, likeCount, isToggling]);

  return {
    isLiked,
    likeCount,
    isLoading,
    isToggling,
    toggleLike,
    isLoggedIn: !!token,
  };
};
