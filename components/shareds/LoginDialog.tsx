"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      {/* 데스크톱: 기존 모달 / 모바일: 전체 화면 */}
      <DialogContent
        className="!w-full !h-full sm:!w-[800px] sm:!h-[600px] !max-w-none sm:!max-w-[800px] flex flex-col sm:flex-row p-0 bg-white sm:rounded-lg rounded-none overflow-hidden"
        showCloseButton={false}
      >
        {/* 모바일 전체 화면 로그인 */}
        <div className="sm:hidden flex flex-col w-full h-full bg-white relative">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-[26px] left-[27px] w-6 h-6 cursor-pointer z-10"
          >
            <Image
              src="/icons/mobile/close-x.svg"
              alt="닫기"
              width={24}
              height={24}
            />
          </button>

          {/* 로고 + 설명 */}
          <div className="flex-1 flex flex-col items-center justify-center px-[17px]">
            <div className="flex flex-col items-center mb-6">
              {/* 로고 */}
              <div className="flex items-center gap-1 mb-4">
                <Image
                  src="/icons/letter-logo.svg"
                  alt="Letter Logo"
                  width={88}
                  height={60}
                  className="w-[88px] h-[60px]"
                />
                <span
                  className="text-[38px] text-[#4C261E]"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  Letter
                </span>
              </div>

              {/* 설명 텍스트 */}
              <p className="text-[#424242] text-xl font-medium leading-8 text-center">
                당신의 사연을 들려주세요
                <br />
                진심을 전하는 편지 서비스 레터
              </p>
            </div>

            {/* SNS 간편 로그인 텍스트 */}
            <p className="text-[#757575] text-base font-medium mb-4 text-center">
              SNS계정으로 간편 로그인
            </p>

            {/* 동의 체크박스 영역 */}
            <div className="w-full px-2 mb-4">
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
                <span className="text-sm font-semibold text-[#333]">
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
                <span className="text-xs text-[#555]">
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
                <span className="text-xs text-[#555]">
                  <span className="text-[#FF9883] font-medium">[필수]</span>{" "}
                  <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#FF9883]">
                    개인정보 수집·이용
                  </Link>
                  에 동의합니다
                </span>
              </label>
            </div>

            {/* 로그인 버튼들 */}
            <div className="w-full space-y-3 px-0">
              {/* 카카오 로그인 */}
              <button
                onClick={() => handleLogin("kakao")}
                disabled={!allAgreed}
                className="w-full h-[52px] bg-[#FEE500] hover:bg-[#FDD835] rounded flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FEE500]"
              >
                <Image
                  src="/icons/mobile/kakao-logo-login.svg"
                  alt="카카오"
                  width={24}
                  height={24}
                />
                <span className="text-black/85 text-xl font-normal">
                  카카오 로그인
                </span>
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={() => handleLogin("naver")}
                disabled={!allAgreed}
                className="w-full h-[52px] bg-[#03C75A] hover:bg-[#02B34F] rounded flex items-center justify-center gap-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#03C75A]"
              >
                <Image
                  src="/icons/mobile/naver-logo-login.svg"
                  alt="네이버"
                  width={24}
                  height={24}
                />
                <span className="text-white text-xl font-normal">
                  네이버 로그인
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 데스크톱 로그인 (기존) */}
        <div className="hidden sm:contents">
          {/* 왼쪽 일러스트 영역 */}
          <LoginModalIllustration className="w-[344px] h-[600px]" />

          {/* 오른쪽 로그인 폼 영역 */}
          <div className="w-[456px] bg-white flex flex-col items-center justify-center">
            {/* 로고 */}
            <div className="flex items-center gap-4 mb-10">
              <LetterLogo className="w-[88px] h-[60px]" />
              <span className="text-[#4C261E] text-[38px]">Letter</span>
            </div>

            {/* 설명 텍스트 */}
            <div className="text-center mb-10 px-4">
              <p className="text-[#757575] text-[24px] font-medium leading-[32px]">
                당신의 사연을 들려주세요
                <br />
                진심을 전하는 편지 서비스 레터
              </p>
            </div>

            {/* 동의 체크박스 영역 */}
            <div className="w-full px-11 mb-6">
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
                <span className="text-base font-semibold text-[#333]">
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
                <span className="text-sm text-[#555]">
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
                <span className="text-sm text-[#555]">
                  <span className="text-[#FF9883] font-medium">[필수]</span>{" "}
                  <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#FF9883]">
                    개인정보 수집·이용
                  </Link>
                  에 동의합니다
                </span>
              </label>
            </div>

            {/* 로그인 버튼들 */}
            <div className="space-y-4">
              <button
                onClick={() => handleLogin("kakao")}
                disabled={!allAgreed}
                className="w-[368px] h-[64px] bg-[#FEE500] hover:bg-[#FDD835] rounded-[12px] flex items-center justify-center gap-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FEE500]"
              >
                <KakaoLogo className="w-[32px] h-[32px]" />
                <span className="text-black text-[26px] font-normal opacity-85">
                  카카오 로그인
                </span>
              </button>

              <button
                onClick={() => handleLogin("naver")}
                disabled={!allAgreed}
                className="w-[368px] h-[64px] bg-[#03C75A] hover:bg-[#02B34F] rounded-[12px] flex items-center justify-center gap-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#03C75A]"
              >
                <NaverLogo className="w-[32px] h-[32px]" />
                <span className="text-white text-[26px] font-normal">
                  네이버 로그인
                </span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
