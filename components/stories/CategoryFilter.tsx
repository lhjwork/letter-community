"use client";

import { getCategoryTheme } from "@/lib/categoryTheme";

const CATEGORIES = ["전체보기", "가족", "사랑", "우정", "성장", "위로", "추억", "감사", "기타"] as const;

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      {CATEGORIES.map((category) => {
        const theme = getCategoryTheme(category);
        const isActive = (category === "전체보기" && !selected) || selected === category;

        return (
          <button
            key={category}
            onClick={() => onChange(category === "전체보기" ? "" : category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive ? theme.color + " shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"}
            `}
          >
            {category !== "전체보기" && theme.emoji} {category}
          </button>
        );
      })}
    </div>
  );
}
