"use client";

const CATEGORIES = [
  { id: "전체보기", label: "전체보기", emoji: "" },
  { id: "가족", label: "가족", emoji: "👨‍👩‍👧‍👦" },
  { id: "사랑", label: "사랑", emoji: "💕" },
  { id: "우정", label: "우정", emoji: "💛" },
  { id: "성장", label: "성장", emoji: "🌱" },
  { id: "위로", label: "위로", emoji: "🫂" },
  { id: "추억", label: "추억", emoji: "📷" },
  { id: "감사", label: "감사", emoji: "⚠️" },
  { id: "기타", label: "기타", emoji: "📝" },
] as const;

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive =
          (category.id === "전체보기" && !selected) || selected === category.id;

        return (
          <button
            key={category.id}
            onClick={() =>
              onChange(category.id === "전체보기" ? "" : category.id)
            }
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${
                isActive
                  ? "bg-gray-800 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {category.emoji && <span className="mr-1">{category.emoji}</span>}
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
