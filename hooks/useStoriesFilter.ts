"use client";

import { track } from "@/lib/analytics/ga";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useStoriesFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const updateFilter = useCallback(
    (updates: Partial<{ search: string; category: string }>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      // 필터 변경 시 페이지를 1로 리셋. 정렬은 최신순 고정이라 예전 sort 쿼리는 지운다
      params.delete("page");
      params.delete("sort");

      track("story_filter", {
        search: params.get("search") || "",
        category: params.get("category") || "",
        sort: "latest",
      });

      router.push(`/stories?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilter = useCallback(() => {
    router.push("/stories");
  }, [router]);

  return {
    search,
    category,
    updateFilter,
    resetFilter,
  };
};
