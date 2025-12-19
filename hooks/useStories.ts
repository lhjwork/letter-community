"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getStories, getCategoryStats, type Story, type Pagination, type SortOption, type CategoryStats } from "@/lib/api";

interface UseStoriesParams {
  limit?: number;
  search?: string;
  sort?: SortOption;
  category?: string;
}

interface UseStoriesReturn {
  stories: Story[];
  pagination: Pagination | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export const useInfiniteStories = (params: UseStoriesParams): UseStoriesReturn => {
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const currentPage = useRef(1);

  const fetchStories = useCallback(
    async (page: number, isNextPage = false) => {
      try {
        if (isNextPage) {
          setIsFetchingNextPage(true);
        } else {
          setIsLoading(true);
          setStories([]);
        }

        const response = await getStories({
          page,
          limit: params.limit || 20,
          search: params.search || undefined,
          sort: params.sort || "latest",
          category: params.category || undefined,
        });

        if (isNextPage) {
          setStories((prev) => [...prev, ...response.data]);
        } else {
          setStories(response.data);
        }
        setPagination(response.pagination);
        currentPage.current = page;
      } catch (error) {
        console.error("사연 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [params.limit, params.search, params.sort, params.category]
  );

  // 필터 변경 시 첫 페이지부터 다시 로드
  useEffect(() => {
    currentPage.current = 1;
    fetchStories(1);
  }, [fetchStories]);

  const fetchNextPage = useCallback(() => {
    if (pagination?.hasNextPage && !isFetchingNextPage) {
      fetchStories(currentPage.current + 1, true);
    }
  }, [pagination?.hasNextPage, isFetchingNextPage, fetchStories]);

  const refetch = useCallback(() => {
    currentPage.current = 1;
    fetchStories(1);
  }, [fetchStories]);

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

export const useCategoryStats = () => {
  const [data, setData] = useState<CategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getCategoryStats();
        setData(response.data);
      } catch (error) {
        console.error("카테고리 통계 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, isLoading };
};
