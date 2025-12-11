"use client";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "핑크", value: "#FFF5F5" },
  { name: "라벤더", value: "#F3E5F5" },
  { name: "스카이", value: "#E3F2FD" },
  { name: "민트", value: "#E0F2F1" },
  { name: "피치", value: "#FFE0B2" },
  { name: "로즈", value: "#FCE4EC" },
  { name: "라임", value: "#F1F8E9" },
  { name: "아이보리", value: "#FFFEF7" },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">배경색</label>
      <div className="grid grid-cols-4 gap-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`
              relative h-16 rounded-lg border-2 transition-all
              ${
                value === color.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
