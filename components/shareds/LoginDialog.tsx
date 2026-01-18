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
        className="!w-[800px] !h-[600px] !max-w-[800px] flex p-0 bg-white rounded-lg overflow-hidden"
        showCloseButton={false}
      >
        {/* 왼쪽 일러스트 영역 */}
        <LoginModalIllustration className="w-[344px] h-[600px]" />

        {/* 오른쪽 로그인 폼 영역 */}
        <div className="w-[456px] bg-white flex flex-col items-center justify-center">
          {/* 로고 */}
          <div className="flex items-center gap-4 mb-[52px]">
            <LetterLogo className="w-[88px] h-[60px]" />
            <span className="text-[#4C261E] text-[38px]">Letter</span>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-center mb-[100px]">
            <p className="text-[#757575] text-[24px] font-medium leading-[32px]">
              당신의 사연을 들려주세요
              <br />
              진심을 전하는 편지 서비스 레터
            </p>
          </div>

          {/* 로그인 버튼들 */}
          <div className="space-y-[28px]">
            {/* 카카오 로그인 */}
            <button
              onClick={() => handleLogin("kakao")}
              className="w-[368px] h-[72px] bg-[#FEE500] hover:bg-[#FDD835] rounded-[12px] flex items-center justify-center gap-4 transition-colors"
            >
              <KakaoLogo className="w-[36px] h-[36px]" />
              <span className="text-black text-[30px] font-normal opacity-85">
                카카오 로그인
              </span>
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={() => handleLogin("naver")}
              className="w-[368px] h-[72px] bg-[#03C75A] hover:bg-[#02B34F] rounded-[12px] flex items-center justify-center gap-[15px] transition-colors"
            >
              <NaverLogo className="w-[36px] h-[36px]" />
              <span className="text-white text-[30px] font-normal">
                네이버 로그인
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
