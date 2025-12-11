"use client";

interface IllustrationSelectorProps {
  selectedIllustration: string;
  onIllustrationChange: (illustration: string) => void;
}

const illustrations = [
  { id: "default", icon: "✉️", label: "편지" },
  { id: "cat", icon: "🐱", label: "고양이" },
  { id: "heart", icon: "❤️", label: "하트" },
  { id: "star", icon: "⭐", label: "별" },
];

export function IllustrationSelector({ selectedIllustration, onIllustrationChange }: IllustrationSelectorProps) {
  return (
    <div className="flex gap-2">
      {illustrations.map((item) => (
        <button
          key={item.id}
          onClick={() => onIllustrationChange(item.id)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${
            selectedIllustration === item.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl mb-1">{item.icon}</span>
          <span className="text-xs text-gray-600">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
