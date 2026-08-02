"use client";

import { useTypewriter } from "@/lib/animations/hooks";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3";
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 30,
  className = "",
  as: Tag = "span",
}: TypewriterTextProps) {
  const { displayedText, isComplete } = useTypewriter(text, speed);

  return (
    <Tag className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-[1px] animate-blink align-text-bottom" />
      )}
    </Tag>
  );
}
