"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDailyPrompt } from "@/lib/ai/daily-prompt";
import LoginDialog from "@/components/shareds/LoginDialog";

const FALLBACK_QUESTIONS = [
  "오늘 가장 오래 남은 감정은 뭐였나요?",
  "지금 누군가에게 한 문장만 남길 수 있다면?",
  "오늘 하루, 어떤 순간이 가장 길게 느껴졌나요?",
  "지금 떠오르는 사람에게 하고 싶은 말이 있나요?",
  "오늘의 하늘은 어떤 색이었나요?",
];

function getFallbackQuestion(): string {
  const today = new Date();
  const dayIndex = today.getDate() % FALLBACK_QUESTIONS.length;
  return FALLBACK_QUESTIONS[dayIndex];
}

export function DailyPrompt() {
  const [question, setQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { data: session } = useSession();
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
        setQuestion(getFallbackQuestion());
      }
      setIsLoading(false);
      // Trigger flip after a short delay
      setTimeout(() => {
        if (mounted) setIsFlipped(true);
      }, 300);
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleWriteClick = () => {
    if (session) {
      router.push("/write");
    } else {
      setShowLogin(true);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center" style={{ perspective: "1000px" }}>
        <motion.div
          className="text-gray-300 dark:text-gray-500 text-sm"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          오늘의 질문을 준비하고 있어요...
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ perspective: "1000px" }}>
      <LoginDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        callbackUrl="/write"
      />
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          // Back of card (question mark)
          <motion.div
            key="back"
            className="border border-dashed border-[#FF9883] rounded-lg p-8 text-center cursor-pointer bg-gradient-to-br from-[#FFF5F3] to-white"
            initial={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFlipped(true)}
            whileHover={{ scale: 1.02, borderColor: "#FF7F65" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="text-4xl text-[#FF9883]"
              animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              ?
            </motion.div>
            <p className="text-sm text-[#FF9883] mt-2">탭하여 오늘의 질문 보기</p>
          </motion.div>
        ) : (
          // Front of card (question)
          <motion.div
            key="front"
            className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 4px 20px rgba(255, 152, 131, 0.15)",
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-[NanumJangMiCe]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {question}
            </motion.p>
            <motion.button
              onClick={handleWriteClick}
              className="mt-4 text-sm text-gray-400 dark:text-gray-500 hover:text-[#FF9883] dark:hover:text-[#FF9883] transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              편지로 남기기 &rarr;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
