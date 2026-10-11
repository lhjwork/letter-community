"use client";

import { track } from "@/lib/analytics/ga";
import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import V8Dialog, { V8Title } from "@/components/ui/V8Dialog";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
  /** 기본: "편지를 쓰려면 / 로그인이 필요해요" */
  title?: ReactNode;
}

// 보드 v8-Modals-1 LoginDialog. 버튼 글자는 노랑·초록 바탕 대비를 위해 보드대로 잉크색
const PROVIDERS = [
  { id: "kakao", label: "카카오로 시작하기", bg: "bg-[#FEE500] border-[#FEE500]" },
  { id: "naver", label: "네이버로 시작하기", bg: "bg-[#03C75A] border-[#03C75A]" },
] as const;

export default function LoginDialog({ isOpen, onClose, callbackUrl = "/", title }: LoginDialogProps) {
  // 개인정보보호법 22조: 동의 사항은 구분해서 받는다(이용약관 / 개인정보 수집·이용)
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const agreed = terms && privacy;

  useEffect(() => {
    if (isOpen) track("login_dialog_open", { from: callbackUrl });
  }, [isOpen, callbackUrl]);

  const handleLogin = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    if (!agreed) return;
    track("login_start", { method: provider });
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <V8Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} stamp="로그인">
      <div className="mt-2 flex items-center gap-2.5 mobile-down:mt-0">
        <Image src="/v8/logo.png" alt="" width={66} height={44} className="h-11 w-[66px] object-contain" />
        <span className="font-pen text-[34px] leading-none">Letter</span>
      </div>
      <V8Title className="m-0 font-pen text-[30px] font-normal leading-[1.3] mobile-down:text-[28px]">
        {title ?? (
          <>
            편지를 쓰려면
            <br />
            로그인이 필요해요
          </>
        )}
      </V8Title>
      {callbackUrl.startsWith("/inquiry") ? (
        <p className="m-0 text-sm leading-[1.8] text-ink-2">
          로그인 없이 문의하려면 메일로 보내 주세요.
          <a href="mailto:letter-community@naver.com" className="flex min-h-11 items-center">
            <span className="border-b border-ink-2">letter-community@naver.com</span>
          </a>
        </p>
      ) : (
        <p className="m-0 text-sm leading-[1.8] text-ink-2">쓴 편지와 받은 답장은 우편함에 모여요.</p>
      )}
      <div className="mt-1 flex flex-col gap-2.5">
        {PROVIDERS.map((p) => (
          <button key={p.id} type="button" onClick={() => handleLogin(p.id)} disabled={!agreed} className={`btn min-h-[52px] text-ink disabled:cursor-not-allowed disabled:opacity-40 ${p.bg}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[13px] leading-[1.7] text-ink-2">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-[18px] w-[18px] shrink-0 accent-ink" />
          <span>
            <span className="badge mr-1.5 bg-brick">필수</span>
            <Link href="/terms" target="_blank" className="border-b border-ink-2">
              이용약관
            </Link>
            에 동의합니다
          </span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[13px] leading-[1.7] text-ink-2">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 h-[18px] w-[18px] shrink-0 accent-ink" />
          <span>
            <span className="badge mr-1.5 bg-brick">필수</span>
            <Link href="/privacy" target="_blank" className="border-b border-ink-2">
              개인정보 수집·이용
            </Link>
            에 동의합니다
          </span>
        </label>
      </div>
    </V8Dialog>
  );
}
