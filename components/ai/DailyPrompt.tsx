"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchDailyPrompt } from "@/lib/ai/daily-prompt";

// 비로그인 또는 API 실패 시 보여줄 기본 질문들
const FALLBACK_QUESTIONS = [
  "오늘 가장 오래 남은 감정은 뭐였나요?",
  "지금 누군가에게 한 문장만 남길 수 있다면?",
  "오늘 하루, 어떤 순간이 가장 길게 느껴졌나요?",
  "지금 떠오르는 사람에게 하고 싶은 말이 있나요?",
  "오늘의 하늘은 어떤 색이었나요?",
];

function getFallbackQuestion(): string {
  // 날짜 기반으로 매일 다른 질문 표시
  const today = new Date();
  const dayIndex = today.getDate() % FALLBACK_QUESTIONS.length;
  return FALLBACK_QUESTIONS[dayIndex];
}

export function DailyPrompt() {
  const [question, setQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      const result = await fetchDailyPrompt();
      if (!mounted) return;

      if (result.question) {
        setQuestion(result.question);
      } else {
        // API 실패 시 (비로그인, 에러 등) 기본 질문 표시
        setQuestion(getFallbackQuestion());
      }
      // Fade-in after a brief delay
      setTimeout(() => setVisible(true), 100);
      setIsLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleWriteClick = () => {
    router.push("/write");
  };

  if (isLoading) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <div className="animate-pulse text-gray-300 dark:text-gray-500 text-sm">
          ...
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div
      className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-opacity duration-700 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-[NanumJangMiCe]">
        {question}
      </p>
      <button
        onClick={handleWriteClick}
        className="mt-4 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        편지로 남기기 &rarr;
      </button>
    </div>
  );
}
