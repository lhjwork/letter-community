"use client";

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
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const handleLogin = async (provider: "kakao" | "naver" | "instagram") => {
    try {
      await signIn(provider, { callbackUrl: "/" });
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
        <div className="w-full sm:w-[456px] bg-white flex flex-col items-center justify-center py-10 sm:py-0">
          {/* 로고 */}
          <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-[52px]">
            <LetterLogo className="w-[60px] h-[40px] sm:w-[88px] sm:h-[60px]" />
            <span className="text-[#4C261E] text-2xl sm:text-[38px]">Letter</span>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-center mb-10 sm:mb-[100px] px-4">
            <p className="text-[#757575] text-base sm:text-[24px] font-medium leading-relaxed sm:leading-[32px]">
              당신의 사연을 들려주세요
              <br />
              진심을 전하는 편지 서비스 레터
            </p>
          </div>

          {/* 로그인 버튼들 */}
          <div className="space-y-4 sm:space-y-[28px] px-6 sm:px-0 w-full sm:w-auto">
            {/* 카카오 로그인 */}
            <button
              onClick={() => handleLogin("kakao")}
              className="w-full sm:w-[368px] h-14 sm:h-[72px] bg-[#FEE500] hover:bg-[#FDD835] rounded-xl sm:rounded-[12px] flex items-center justify-center gap-3 sm:gap-4 transition-colors"
            >
              <KakaoLogo className="w-7 h-7 sm:w-[36px] sm:h-[36px]" />
              <span className="text-black text-lg sm:text-[30px] font-normal opacity-85">
                카카오 로그인
              </span>
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={() => handleLogin("naver")}
              className="w-full sm:w-[368px] h-14 sm:h-[72px] bg-[#03C75A] hover:bg-[#02B34F] rounded-xl sm:rounded-[12px] flex items-center justify-center gap-3 sm:gap-[15px] transition-colors"
            >
              <NaverLogo className="w-7 h-7 sm:w-[36px] sm:h-[36px]" />
              <span className="text-white text-lg sm:text-[30px] font-normal">
                네이버 로그인
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
