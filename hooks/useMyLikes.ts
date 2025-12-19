"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getMyLikes, type Story, type Pagination } from "@/lib/api";

interface UseMyLikesReturn {
  stories: Story[];
  pagination: Pagination | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export const useMyLikes = (limit = 20): UseMyLikesReturn => {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const currentPage = useRef(1);

  const fetchLikes = useCallback(
    async (page: number, isNextPage = false) => {
      if (!token) return;

      try {
        if (isNextPage) {
          setIsFetchingNextPage(true);
        } else {
          setIsLoading(true);
          setStories([]);
        }

        const response = await getMyLikes(token, { page, limit });

        if (isNextPage) {
          setStories((prev) => [...prev, ...response.data]);
        } else {
          setStories(response.data);
        }
        setPagination(response.pagination);
        currentPage.current = page;
      } catch (error) {
        console.error("좋아요 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [token, limit]
  );

  useEffect(() => {
    if (token) {
      currentPage.current = 1;
      fetchLikes(1);
    }
  }, [token, fetchLikes]);

  const fetchNextPage = useCallback(() => {
    if (pagination?.hasNextPage && !isFetchingNextPage) {
      fetchLikes(currentPage.current + 1, true);
    }
  }, [pagination?.hasNextPage, isFetchingNextPage, fetchLikes]);

  const refetch = useCallback(() => {
    currentPage.current = 1;
    fetchLikes(1);
  }, [fetchLikes]);

  return {
    stories,
    pagination,
    isLoading,
    isFetchingNextPage,
    hasNextPage: pagination?.hasNextPage || false,
    fetchNextPage,
    refetch,
  };
};
