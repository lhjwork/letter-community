"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/lib/animations/hooks";
import { fadeInUp, staggerContainerWide, staggerItem, buttonPop } from "@/lib/animations/config";
import type { Story } from "@/lib/api";

interface StoryCardProps {
  story: Story;
  index: number;
}

function StoryCard({ story, index }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 50);
  };

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/letter/${story._id}`}>
        <div className="bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl p-6 sm:p-8 w-full sm:w-[285px] h-[280px] sm:h-[312px] relative cursor-pointer overflow-hidden">
          {/* Shimmer overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            whileHover={{ translateX: "200%" }}
            transition={{ duration: 0.6 }}
          />

          {/* Horizontal lines */}
          <div className="space-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-px bg-[#EDEDED]" />
            ))}
          </div>

          {/* Date */}
          <div className="absolute top-8 right-8">
            <span className="text-lg text-[#424242]">{formatDate(story.createdAt)}</span>
          </div>

          {/* Category badge */}
          {story.category && (
            <motion.div
              className="absolute top-8 left-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 + index * 0.1 }}
            >
              <span className="px-3 py-1 bg-[#FF7F65] text-white text-sm rounded-full">{getCategoryLabel(story.category)}</span>
            </motion.div>
          )}

          {/* Title / content preview */}
          <div className="absolute top-20 left-8 right-8">
            <p className="text-base text-[#424242] line-clamp-3">{story.title || getPlainText(story.content || "")}</p>
          </div>

          {/* Author */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2">
            <span className="text-xl font-medium text-[#424242]">{story.authorName || "익명"}</span>
          </div>

          {/* Stats */}
          {(story.viewCount || story.likeCount) && (
            <div className="absolute bottom-8 left-8 flex items-center gap-3 text-sm text-[#757575]">
              {story.viewCount !== undefined && <span>👁 {story.viewCount}</span>}
              {story.likeCount !== undefined && <span>❤️ {story.likeCount}</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    friendship: "우정",
    love: "사랑",
    family: "가족",
    gratitude: "감사",
    apology: "사과",
    encouragement: "응원",
    memory: "추억",
    growth: "성장",
    comfort: "위로",
    other: "기타",
    우정: "우정",
    사랑: "사랑",
    가족: "가족",
    감사: "감사",
    성장: "성장",
    위로: "위로",
    추억: "추억",
    기타: "기타",
  };
  return labels[category] || category;
}

interface StoryListSectionProps {
  stories: Story[];
}

export default function StoryListSection({ stories }: StoryListSectionProps) {
  const displayStories = stories.slice(0, 4);
  const { ref, controls } = useScrollReveal();

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20">
        {/* Title - scroll reveal */}
        <motion.div
          ref={ref}
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-2 sm:mb-4">사연을 남겨주세요</h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[#757575]">당신의 이야기가 한장의 편지로 이어집니다</p>
        </motion.div>

        {/* Story cards - stagger grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          variants={staggerContainerWide}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayStories.map((story, index) => (
            <StoryCard key={story._id} story={story} index={index} />
          ))}
        </motion.div>

        {/* More button */}
        <motion.div
          className="flex justify-center"
          variants={buttonPop}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/stories" className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors">
            더 많은 사연 보기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
