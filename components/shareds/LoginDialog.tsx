"use client";

import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl sm:text-4xl text-black text-center" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
            로그인
          </DialogTitle>
          <DialogDescription className="text-center">소셜 계정으로 간편하게 로그인하세요</DialogDescription>
        </DialogHeader>

        {/* 로그인 버튼들 */}
        <div className="space-y-3 mt-4">
          {/* 카카오 로그인 */}
          <button onClick={() => handleLogin("kakao")} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg transition-colors cursor-pointer">
            <div className="w-6 h-6 relative">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.5 3 2 6.58 2 11C2 13.5 3.5 15.75 5.88 17.13L4.75 21L8.88 18.5C9.88 18.75 10.94 18.88 12 18.88C17.5 18.88 22 15.3 22 10.88C22 6.58 17.5 3 12 3Z" fill="#000000" />
              </svg>
            </div>
            <span className="text-black font-medium">카카오로 시작하기</span>
          </button>

          {/* 네이버 로그인 */}
          <button onClick={() => handleLogin("naver")} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] hover:bg-[#02B34F] rounded-lg transition-colors cursor-pointer">
            <div className="w-6 h-6 relative">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-white font-medium">네이버로 시작하기</span>
          </button>

          {/* 인스타그램 로그인 */}
          <button
            onClick={() => handleLogin("instagram")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-linear-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 rounded-lg transition-opacity cursor-pointer"
          >
            <div className="w-6 h-6 relative">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <span className="text-white font-medium">인스타그램으로 시작하기</span>
          </button>
        </div>

        {/* 푸터 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>로그인하시면 이용약관 및 개인정보처리방침에</p>
          <p>동의하는 것으로 간주됩니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
