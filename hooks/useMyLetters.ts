"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getMyLetters, type Letter, type Pagination } from "@/lib/api";

interface UseMyLettersReturn {
  letters: Letter[];
  pagination: Pagination | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export const useMyLetters = (limit = 20): UseMyLettersReturn => {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [letters, setLetters] = useState<Letter[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const currentPage = useRef(1);

  const fetchLetters = useCallback(
    async (page: number, isNextPage = false) => {
      if (!token) return;

      try {
        if (isNextPage) {
          setIsFetchingNextPage(true);
        } else {
          setIsLoading(true);
          setLetters([]);
        }

        const response = await getMyLetters(token, { page, limit });

        if (isNextPage) {
          setLetters((prev) => [...prev, ...response.data]);
        } else {
          setLetters(response.data);
        }
        setPagination(response.pagination);
        currentPage.current = page;
      } catch (error) {
        console.error("편지 목록 로드 실패:", error);
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
      fetchLetters(1);
    }
  }, [token, fetchLetters]);

  const fetchNextPage = useCallback(() => {
    if (pagination?.hasNextPage && !isFetchingNextPage) {
      fetchLetters(currentPage.current + 1, true);
    }
  }, [pagination?.hasNextPage, isFetchingNextPage, fetchLetters]);

  const refetch = useCallback(() => {
    currentPage.current = 1;
    fetchLetters(1);
  }, [fetchLetters]);

  return {
    letters,
    pagination,
    isLoading,
    isFetchingNextPage,
    hasNextPage: pagination?.hasNextPage || false,
    fetchNextPage,
    refetch,
  };
};
