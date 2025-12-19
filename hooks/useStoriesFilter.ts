"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SortOption } from "@/lib/api";

export const useStoriesFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = (searchParams.get("sort") as SortOption) || "latest";
  const category = searchParams.get("category") || "";

  const updateFilter = useCallback(
    (updates: Partial<{ search: string; sort: string; category: string }>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      // 필터 변경 시 페이지를 1로 리셋
      params.delete("page");

      router.push(`/stories?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilter = useCallback(() => {
    router.push("/stories");
  }, [router]);

  return {
    search,
    sort,
    category,
    updateFilter,
    resetFilter,
  };
};
