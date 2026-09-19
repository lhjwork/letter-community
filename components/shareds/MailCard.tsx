"use client";

import Link from "next/link";
import Image from "next/image";

// Masonry height pattern: 3 sizes for visual variety
const HEIGHT_PATTERN = [280, 360, 280, 440, 360, 280, 440, 280, 360, 280, 360, 440];

const getLinePositions = (height: number) => {
  const lines = [];
  for (let y = 48; y < height - 20; y += 48) {
    lines.push(y);
  }
  return lines;
};

const getMaxLines = (height: number) => {
  if (height >= 440) return 10;
  if (height >= 360) return 7;
  return 4;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
};

interface MailCardItem {
  _id: string;
  title?: string;
  content?: string;
  authorName?: string;
  createdAt: string;
}

export default function MailCard({ item, index }: { item: MailCardItem; index: number }) {
  const cardHeight = HEIGHT_PATTERN[index % HEIGHT_PATTERN.length];
  const lines = getLinePositions(cardHeight);
  const maxLines = getMaxLines(cardHeight);

  return (
    <Link href={`/letter/${item._id}`} className="block w-full break-inside-avoid mb-4 sm:mb-5">
      <div
        className="bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl w-full relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden"
        style={{ height: `${cardHeight}px` }}
      >
        {/* Horizontal lines */}
        {lines.map((lineY) => (
          <div
            key={lineY}
            className="absolute left-0 right-0 h-0.5 bg-[#EDEDED]"
            style={{ top: `${lineY}px` }}
          />
        ))}

        {/* Envelope icon - top left */}
        <div className="absolute top-3.5 left-3">
          <Image src="/icons/envelope-icon.png" alt="" width={28} height={24} className="w-7 h-6" />
        </div>

        {/* Date - top right */}
        <div className="absolute top-4 right-3 sm:right-4">
          <span className="text-[16px] sm:text-[18px] text-[#424242] font-['Pretendard']">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Title/Content preview */}
        <div className="absolute top-14 left-4 right-4 sm:left-5 sm:right-5 bottom-14">
          <p
            className="text-[15px] sm:text-[16px] text-[#424242] leading-relaxed font-['Pretendard'] overflow-hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: maxLines, WebkitBoxOrient: "vertical" }}
          >
            {item.title || (item.content ? item.content.replace(/<[^>]*>/g, "").substring(0, 200) : "")}
          </p>
        </div>

        {/* Author - bottom right */}
        <div className="absolute bottom-4 right-3 sm:right-4">
          <span className="text-[18px] sm:text-[20px] font-medium text-[#424242] font-['Pretendard']">
            {item.authorName || "익명"}
          </span>
        </div>
      </div>
    </Link>
  );
}
