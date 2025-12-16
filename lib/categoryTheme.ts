export const categoryThemes = {
  가족: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    emoji: "👨‍👩‍👧‍👦",
    gradient: "from-orange-400 to-red-400",
    description: "가족과의 소중한 이야기",
  },
  사랑: {
    color: "bg-pink-100 text-pink-800 border-pink-200",
    emoji: "💕",
    gradient: "from-pink-400 to-rose-400",
    description: "사랑과 연애 이야기",
  },
  우정: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    emoji: "🤝",
    gradient: "from-blue-400 to-cyan-400",
    description: "친구와의 우정 이야기",
  },
  성장: {
    color: "bg-green-100 text-green-800 border-green-200",
    emoji: "🌱",
    gradient: "from-green-400 to-emerald-400",
    description: "성장과 도전의 이야기",
  },
  위로: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    emoji: "🫂",
    gradient: "from-purple-400 to-indigo-400",
    description: "위로와 공감의 이야기",
  },
  추억: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    emoji: "📸",
    gradient: "from-amber-400 to-yellow-400",
    description: "추억과 그리움의 이야기",
  },
  감사: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    emoji: "🙏",
    gradient: "from-teal-400 to-cyan-400",
    description: "감사와 고마움의 이야기",
  },
  기타: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    emoji: "📝",
    gradient: "from-gray-400 to-slate-400",
    description: "다양한 이야기",
  },
} as const;

export type Category = keyof typeof categoryThemes;

export function getCategoryTheme(category: string) {
  return categoryThemes[category as Category] || categoryThemes["기타"];
}
