"use client";

import { useState } from "react";
import Image from "next/image";
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
            className="bg-white rounded-2xl border-2 border-[#F0E0DC] p-6 sm:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-[#424242]"
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
                className="flex justify-center mb-3"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.2 }}
              >
                <Image src="/icons/letter-heart-icon.svg" alt="" width={30} height={27} className="w-12 h-11" />
              </motion.div>
              <h3 className="text-2xl font-bold">편지가 완성되었습니다!</h3>
              <p className="text-base text-[#757575] mt-1">이제 원하는 사람에게 공유해보세요</p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {/* 제목 표시 */}
              <motion.div
                className="border-b border-[#F0E0DC] pb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <p className="text-sm text-[#757575] mb-1">편지 제목</p>
                <p className="text-lg font-semibold">{letterTitle}</p>
              </motion.div>

              {/* 공유 링크 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <p className="text-sm text-[#757575] mb-1">공유 링크</p>
                <div className="bg-[#FFF7F5] border border-[#F0E0DC] rounded-lg p-3">
                  <p className="text-sm break-all">{letterUrl}</p>
                </div>
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
                  className="flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] h-12 rounded-lg hover:brightness-95 transition text-lg font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Image src="/icons/kakao-logo.svg" alt="" width={20} height={20} className="w-5 h-5" />
                  카카오톡
                </motion.button>
                <motion.button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 bg-[#FF9883] text-white h-12 rounded-lg hover:bg-[#FF7F65] transition-colors text-lg font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {copied ? "복사됨 ✓" : "링크 복사"}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* 안내 메시지 */}
            <motion.p
              className="mt-5 text-sm text-[#757575] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              이 링크를 받은 사람은 누구나 편지를 읽을 수 있습니다
            </motion.p>

            {/* 닫기 버튼 */}
            <motion.div
              className="mt-5 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.3 }}
            >
              <motion.button
                onClick={onClose}
                className="min-w-[120px] h-12 bg-white border-2 border-[#FF9883] text-[#FF9883] rounded-lg hover:bg-orange-50 transition-colors text-lg font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
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
