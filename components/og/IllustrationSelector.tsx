"use client";

interface IllustrationSelectorProps {
  value: string;
  onChange: (illustration: string) => void;
}

const ILLUSTRATIONS = [
  { emoji: "💌", name: "편지" },
  { emoji: "💖", name: "하트" },
  { emoji: "🌸", name: "벚꽃" },
  { emoji: "🌹", name: "장미" },
  { emoji: "🎀", name: "리본" },
  { emoji: "✨", name: "반짝임" },
  { emoji: "🌙", name: "달" },
  { emoji: "⭐", name: "별" },
  { emoji: "🦋", name: "나비" },
  { emoji: "🌈", name: "무지개" },
];

export function IllustrationSelector({
  value,
  onChange,
}: IllustrationSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">일러스트</label>
      <div className="grid grid-cols-5 gap-3">
        {ILLUSTRATIONS.map((item) => (
          <button
            key={item.emoji}
            onClick={() => onChange(item.emoji)}
            className={`
              h-16 rounded-lg border-2 transition-all text-3xl
              ${
                value === item.emoji
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
            title={item.name}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
