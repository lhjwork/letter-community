"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  LetterLogo,
  LoginModalIllustration,
  KakaoLogo,
  NaverLogo,
} from "@/components/icons";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export default function LoginDialog({ isOpen, onClose, callbackUrl = "/" }: LoginDialogProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const allAgreed = agreeTerms && agreePrivacy;

  const handleAgreeAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
  };

  const handleLogin = async (provider: "kakao" | "naver" | "instagram") => {
    if (!allAgreed) return;
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="!w-[95vw] sm:!w-[800px] !h-auto sm:!h-[600px] !max-w-[800px] flex flex-col sm:flex-row p-0 bg-white rounded-lg overflow-hidden"
        showCloseButton={false}
      >
        {/* 왼쪽 일러스트 영역 - 모바일에서 숨김 */}
        <LoginModalIllustration className="hidden sm:block w-[344px] h-[600px]" />

        {/* 오른쪽 로그인 폼 영역 */}
        <div className="w-full sm:w-[456px] bg-white flex flex-col items-center justify-center py-8 sm:py-0">
          {/* 로고 */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
            <LetterLogo className="w-[60px] h-[40px] sm:w-[88px] sm:h-[60px]" />
            <span className="text-[#4C261E] text-2xl sm:text-[38px]">Letter</span>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-center mb-6 sm:mb-10 px-4">
            <p className="text-[#757575] text-base sm:text-[24px] font-medium leading-relaxed sm:leading-[32px]">
              당신의 사연을 들려주세요
              <br />
              진심을 전하는 편지 서비스 레터
            </p>
          </div>

          {/* 동의 체크박스 영역 */}
          <div className="w-full px-6 sm:px-11 mb-5 sm:mb-6">
            <label className="flex items-center gap-2.5 cursor-pointer mb-3 pb-3 border-b border-[#F0E0DC]">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="peer sr-only"
              />
              <span className="w-5 h-5 rounded border-2 border-[#ccc] flex items-center justify-center shrink-0 peer-checked:bg-[#FF9883] peer-checked:border-[#FF9883] transition-colors">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#333]">
                전체 동의
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="peer sr-only"
              />
              <span className="w-5 h-5 rounded border-2 border-[#ccc] flex items-center justify-center shrink-0 peer-checked:bg-[#FF9883] peer-checked:border-[#FF9883] transition-colors">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs sm:text-sm text-[#555]">
                <span className="text-[#FF9883] font-medium">[필수]</span>{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-[#FF9883]">
                  서비스 이용약관
                </Link>
                에 동의합니다
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="peer sr-only"
              />
              <span className="w-5 h-5 rounded border-2 border-[#ccc] flex items-center justify-center shrink-0 peer-checked:bg-[#FF9883] peer-checked:border-[#FF9883] transition-colors">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs sm:text-sm text-[#555]">
                <span className="text-[#FF9883] font-medium">[필수]</span>{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#FF9883]">
                  개인정보 수집·이용
                </Link>
                에 동의합니다
              </span>
            </label>
          </div>

          {/* 로그인 버튼들 */}
          <div className="space-y-3 sm:space-y-4 px-6 sm:px-0 w-full sm:w-auto">
            {/* 카카오 로그인 */}
            <button
              onClick={() => handleLogin("kakao")}
              disabled={!allAgreed}
              className="w-full sm:w-[368px] h-14 sm:h-[64px] bg-[#FEE500] hover:bg-[#FDD835] rounded-xl sm:rounded-[12px] flex items-center justify-center gap-3 sm:gap-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FEE500]"
            >
              <KakaoLogo className="w-7 h-7 sm:w-[32px] sm:h-[32px]" />
              <span className="text-black text-lg sm:text-[26px] font-normal opacity-85">
                카카오 로그인
              </span>
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={() => handleLogin("naver")}
              disabled={!allAgreed}
              className="w-full sm:w-[368px] h-14 sm:h-[64px] bg-[#03C75A] hover:bg-[#02B34F] rounded-xl sm:rounded-[12px] flex items-center justify-center gap-3 sm:gap-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#03C75A]"
            >
              <NaverLogo className="w-7 h-7 sm:w-[32px] sm:h-[32px]" />
              <span className="text-white text-lg sm:text-[26px] font-normal">
                네이버 로그인
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
