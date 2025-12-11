"use client";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colors = [
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#eff6ff" },
  { name: "Green", value: "#f0fdf4" },
  { name: "Yellow", value: "#fefce8" },
  { name: "Red", value: "#fef2f2" },
  { name: "Purple", value: "#faf5ff" },
  { name: "Pink", value: "#fdf2f8" },
  { name: "Gray", value: "#f3f4f6" },
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onColorChange(color.value)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.value ? "border-blue-500 scale-110" : "border-gray-200"}`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
}
