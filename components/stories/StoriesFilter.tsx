"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";

export const CATEGORIES = ["위로", "가족", "감사", "사랑", "성장", "우정", "추억", "기타"];
/** 저장값(한국어) → shared.categories 키. 화면에는 t(`categories.${CATEGORY_KEY[c]}`) */
export const CATEGORY_KEY: Record<string, string> = { 위로: "comfort", 가족: "family", 감사: "thanks", 사랑: "love", 성장: "growth", 우정: "friendship", 추억: "memories", 기타: "other" };

/** 검색 + 마음 칩(정렬은 최신순 고정). 값은 URL 쿼리에 있고, 바뀌면 서버 페이지가 다시 렌더링된다 */
export default function StoriesFilter() {
  const t = useTranslations("shared");
  const { search, category, updateFilter } = useStoriesFilter();
  const [q, setQ] = useState(search);

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
            {t("stories.searchLabel")}
          </label>
          <input id="q" type="search" className="field" placeholder={t("stories.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>
      <div role="group" aria-label={t("stories.categoryGroup")} className="flex flex-wrap gap-2 border-b-2 border-ink pb-6 mobile-down:flex-nowrap mobile-down:gap-2.5 mobile-down:overflow-x-auto mobile-down:pb-4 mobile-down:[scrollbar-width:thin]">
        {["", ...CATEGORIES].map((c) => (
          <button key={c} type="button" aria-pressed={category === c} className={`chip ${category === c ? "chip-on" : ""}`} onClick={() => updateFilter({ category: c })}>
            {c ? t(`categories.${CATEGORY_KEY[c]}`) : t("stories.all")}
          </button>
        ))}
      </div>
    </section>
  );
}
