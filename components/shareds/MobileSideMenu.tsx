"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NAV, todayLabel } from "./Header";

interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** 로그인 전 보호 라우트를 누르면 콜백 URL 과 함께 로그인 모달을 연다 */
  onLoginClick: (callbackUrl: string) => void;
}

export default function MobileSideMenu({ isOpen, onClose, onLoginClick }: MobileSideMenuProps) {
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const needLogin = (href: string) => () => {
    onClose();
    onLoginClick(href);
  };

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 닫기"
        inert={!isOpen}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/45 transition-opacity duration-300 mobile-down:block hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <nav
        aria-label="전체 메뉴"
        inert={!isOpen}
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[82%] flex-col gap-5 border-l border-rule bg-paper px-5 pb-6 pt-4 shadow-[-16px_0_32px_rgba(43,43,43,0.2)] transition-transform duration-300 ease-in-out mobile-down:flex hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <span className="airmail absolute bottom-0 left-0 top-0 w-2" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <span className="font-pen text-lg text-ink-3" suppressHydrationWarning>
            {todayLabel()}
          </span>
          <button ref={closeRef} type="button" aria-label="닫기" onClick={onClose} className="h-11 w-11 border-0 bg-transparent font-pen text-[28px] text-ink">
            ✕
          </button>
        </div>

        {loggedIn ? (
          <Link href="/my-page" onClick={onClose} className="flex items-center gap-3 border-b-2 border-ink py-3.5">
            <span className="flex flex-col">
              <strong className="font-pen text-[26px] font-normal">{session?.user?.name}</strong>
              <span className="text-xs text-ink-3">마이페이지 →</span>
            </span>
          </Link>
        ) : (
          <button type="button" onClick={needLogin("/")} className="flex min-h-14 items-center gap-3 border-b-2 border-ink py-3.5 text-left">
            <strong className="font-pen text-[26px] font-normal">로그인</strong>
          </button>
        )}

        <div className="m-nav">
          {NAV.map((n) =>
            loggedIn || n.href === "/stories" ? (
              <Link key={n.href} href={n.href} onClick={onClose}>
                {n.label}
              </Link>
            ) : (
              <button key={n.href} type="button" onClick={needLogin(n.href)} className="w-full border-0 border-b bg-transparent text-left">
                {n.label}
              </button>
            ),
          )}
          {loggedIn ? (
            <Link href="/drafts" onClick={onClose} className="text-[22px] text-ink-2">
              임시저장
            </Link>
          ) : (
            <button type="button" onClick={needLogin("/drafts")} className="w-full border-0 border-b bg-transparent text-left text-[22px] text-ink-2">
              임시저장
            </button>
          )}
        </div>

        {loggedIn ? (
          <Link href="/write?kind=story" onClick={onClose} className="btn btn-brick min-h-14 text-[26px]">
            사연 남기기
          </Link>
        ) : (
          <button type="button" onClick={needLogin("/write?kind=story")} className="btn btn-brick min-h-14 text-[26px]">
            사연 남기기
          </button>
        )}

        <div className="mt-auto flex flex-col gap-3 text-xs text-ink-3">
          {loggedIn && (
            <button
              type="button"
              onClick={async () => {
                onClose();
                await signOut({ callbackUrl: "/" });
              }}
              className="btn min-h-11 self-start border-rule text-xl text-ink-3"
            >
              로그아웃
            </button>
          )}
          <div className="flex gap-3.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
            <a href="mailto:letter-community@naver.com">문의하기</a>
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
