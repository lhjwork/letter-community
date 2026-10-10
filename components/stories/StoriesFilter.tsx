"use client";

import { useState } from "react";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";
import type { SortOption } from "@/lib/api";

export const CATEGORIES = ["위로", "가족", "감사", "사랑", "성장", "우정", "추억", "기타"];
const SORTS: { value: SortOption; label: string; short: string }[] = [
  { value: "latest", label: "최신순", short: "최신" },
  { value: "popular", label: "인기순", short: "인기" },
];

/** 검색 + 정렬 토글 + 마음 칩. 값은 URL 쿼리에 있고, 바뀌면 서버 페이지가 다시 렌더링된다 */
export default function StoriesFilter() {
  const { search, sort, category, updateFilter } = useStoriesFilter();
  const [q, setQ] = useState(search);
  const toggle = "chip rounded-none border-0";

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 mobile-down:gap-3 mobile-down:px-4">
      <div className="flex flex-wrap items-center gap-3 mobile-down:flex-nowrap mobile-down:gap-2">
        <form
          className="flex flex-1 basis-[280px] mobile-down:basis-auto"
          onSubmit={(e) => {
            e.preventDefault();
            updateFilter({ search: q.trim() });
          }}
        >
          <label htmlFor="q" className="sr-only">
            사연 검색
          </label>
          <input id="q" type="search" className="field" placeholder="검색" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <div role="group" aria-label="정렬" className="flex rounded-[3px] border-[1.5px] border-rule">
          {SORTS.map((s, i) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={sort === s.value}
              className={`${toggle} ${i > 0 ? "border-l-[1.5px] border-l-rule" : ""} ${sort === s.value ? "chip-on" : ""} mobile-down:px-3 mobile-down:text-lg`}
              onClick={() => updateFilter({ sort: s.value === "latest" ? "" : s.value })}
            >
              <span className="mobile-down:hidden">{s.label}</span>
              <span className="hidden mobile-down:inline">{s.short}</span>
            </button>
          ))}
        </div>
      </div>
      <div role="group" aria-label="마음" className="flex flex-wrap gap-2 border-b-2 border-ink pb-6 mobile-down:flex-nowrap mobile-down:gap-2.5 mobile-down:overflow-x-auto mobile-down:pb-4 mobile-down:[scrollbar-width:thin]">
        {["", ...CATEGORIES].map((c) => (
          <button key={c} type="button" aria-pressed={category === c} className={`chip ${category === c ? "chip-on" : ""}`} onClick={() => updateFilter({ category: c })}>
            {c || "전체"}
          </button>
        ))}
      </div>
    </section>
  );
}
