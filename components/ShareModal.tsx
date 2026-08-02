"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterUrl: string;
  letterTitle: string;
}

// Kakao 타입 선언
declare global {
  interface Window {
    Kakao?: {
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
        }) => void;
      };
    };
  }
}

export default function ShareModal({ isOpen, onClose, letterUrl, letterTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(letterUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      // 폴백: 텍스트 선택
      const textArea = document.createElement("textarea");
      textArea.value = letterUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("복사 실패:", err);
      }
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToKakao = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: letterTitle,
          description: "편지로 마음을 전하는 특별한 공간",
          imageUrl: `${window.location.origin}/api/og`,
          link: {
            mobileWebUrl: letterUrl,
            webUrl: letterUrl,
          },
        },
        buttons: [
          {
            title: "편지 읽기",
            link: {
              mobileWebUrl: letterUrl,
              webUrl: letterUrl,
            },
          },
        ],
      });
    } else {
      // 카카오 SDK가 없으면 URL 복사
      copyToClipboard();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <motion.div
                className="text-4xl mb-3"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.2 }}
              >
                💌
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800">편지가 완성되었습니다!</h3>
              <p className="text-sm text-gray-500 mt-1">이제 원하는 사람에게 공유해보세요</p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {/* 제목 표시 */}
              <motion.div
                className="bg-gray-50 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <p className="text-sm text-gray-600 mb-2 font-medium">편지 제목</p>
                <p className="font-semibold text-gray-800">{letterTitle}</p>
              </motion.div>

              {/* 공유 링크 */}
              <motion.div
                className="bg-blue-50 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <p className="text-sm text-blue-600 mb-2 font-medium">공유 링크</p>
                <div className="bg-white rounded border p-2 mb-3">
                  <p className="text-xs font-mono break-all text-gray-700">{letterUrl}</p>
                </div>
                <motion.button
                  onClick={copyToClipboard}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? "복사됨! ✓" : "링크 복사하기"}
                </motion.button>
              </motion.div>

              {/* 공유 버튼들 */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.button
                  onClick={shareToKakao}
                  className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(250, 204, 21, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>💬</span>
                  카카오톡
                </motion.button>
                <motion.button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>📋</span>
                  링크 복사
                </motion.button>
              </motion.div>
            </motion.div>

            {/* 안내 메시지 */}
            <motion.div
              className="mt-6 p-3 bg-pink-50 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <p className="text-xs text-pink-700 text-center">이 링크를 받은 사람은 누구나 편지를 읽을 수 있습니다</p>
            </motion.div>

            {/* 닫기 버튼 */}
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.3 }}
            >
              <motion.button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                닫기
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
