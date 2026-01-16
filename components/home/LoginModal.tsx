"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#FF8B7B] to-[#FFA590] p-6 text-center">
          <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-4">비로그인상태</div>
          <h2 className="text-2xl font-bold text-white">Letter</h2>
        </div>

        {/* 본문 */}
        <div className="p-8">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-3xl font-bold text-gray-800">
              <span className="text-4xl">✉️</span>
              <span>Letter</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">진심을 전하는 편지 커뮤니티</p>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            {/* 카카오 로그인 */}
            <button
              onClick={() => signIn("kakao", { callbackUrl: "/home" })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] text-[#000000] rounded-xl font-semibold hover:bg-[#fdd835] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.7 2.8-.8 3.2-.1.5.2.5.4.4.3-.1 3.7-2.5 4.3-2.9.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
              </svg>
              <span>카카오 로그인</span>
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={() => signIn("naver", { callbackUrl: "/home" })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#03C75A] text-white rounded-xl font-semibold hover:bg-[#02b350] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
              </svg>
              <span>네이버 로그인</span>
            </button>
          </div>

          {/* 닫기 버튼 */}
          <button onClick={onClose} className="w-full mt-6 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
