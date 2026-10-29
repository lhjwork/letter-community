"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import LocaleSwitch from "@/components/LocaleSwitch";
import { NAV, todayLabel } from "./Header";

interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** 로그인 전 보호 라우트를 누르면 콜백 URL 과 함께 로그인 모달을 연다 */
  onLoginClick: (callbackUrl: string) => void;
}

export default function MobileSideMenu({ isOpen, onClose, onLoginClick }: MobileSideMenuProps) {
  const t = useTranslations("shared");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";
  const closeRef = useRef<HTMLButtonElement>(null);
  // 닫으면 열기 전 포커스(메뉴 버튼)로 돌려보낸다(키보드·스크린리더 사용자가 길을 잃지 않게)
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) {
      const active = document.activeElement as HTMLElement | null;
      // iOS Safari 는 버튼을 탭해도 포커스를 주지 않는다 → 헤더 메뉴 버튼으로
      returnTo.current = active && active !== document.body ? active : document.querySelector<HTMLElement>("button[data-menu-button]");
      closeRef.current?.focus();
    } else if (returnTo.current) {
      returnTo.current.focus();
      returnTo.current = null;
    }
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
        aria-label={t("mobileMenu.closeMenu")}
        inert={!isOpen}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/45 transition-opacity duration-300 mobile-down:block hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <nav
        aria-label={t("mobileMenu.fullMenu")}
        inert={!isOpen}
        // 닫힘: 그림자를 떼고 invisible(닫는 전환이 끝난 뒤 적용, 열 때는 즉시 보여야 ✕ 에 포커스가 간다) — 닫힌 서랍 그림자가 화면 오른쪽에 번지지 않게
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[82%] flex-col gap-5 border-l border-rule bg-paper px-5 pb-6 pt-4 duration-300 ease-in-out mobile-down:flex hidden ${isOpen ? "visible translate-x-0 shadow-[-16px_0_32px_rgba(43,43,43,0.2)] transition-transform" : "invisible translate-x-full transition-[translate,visibility]"}`}
      >
        <span className="airmail absolute bottom-0 left-0 top-0 w-2" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <span className="font-pen text-lg text-ink-3" suppressHydrationWarning>
            {todayLabel(locale)}
          </span>
          <button ref={closeRef} type="button" aria-label={t("mobileMenu.close")} onClick={onClose} className="h-11 w-11 border-0 bg-transparent font-pen text-[28px] text-ink">
            ✕
          </button>
        </div>

        {loggedIn ? (
          <Link href="/my-page" onClick={onClose} className="flex items-center gap-3 border-b-2 border-ink py-3.5">
            <span className="flex flex-col">
              <strong className="font-pen text-[26px] font-normal">{session?.user?.name}</strong>
              <span className="text-xs text-ink-3">{t("mobileMenu.myPage")}</span>
            </span>
          </Link>
        ) : (
          <button type="button" onClick={needLogin("/")} className="flex min-h-14 items-center gap-3 border-b-2 border-ink py-3.5 text-left">
            <strong className="font-pen text-[26px] font-normal">{t("mobileMenu.login")}</strong>
          </button>
        )}

        <div className="m-nav">
          {NAV.map((n) =>
            loggedIn || n.href === "/stories" ? (
              <Link key={n.href} href={n.href} onClick={onClose}>
                {t(`header.nav.${n.key}`)}
              </Link>
            ) : (
              <button key={n.href} type="button" onClick={needLogin(n.href)} className="w-full border-0 border-b bg-transparent text-left">
                {t(`header.nav.${n.key}`)}
              </button>
            ),
          )}
          {loggedIn ? (
            <Link href="/drafts" onClick={onClose}>
              {t("mobileMenu.drafts")}
            </Link>
          ) : (
            <button type="button" onClick={needLogin("/drafts")} className="w-full border-0 border-b bg-transparent text-left">
              {t("mobileMenu.drafts")}
            </button>
          )}
          <LocaleSwitch className="w-full border-0 border-b bg-transparent text-left" />
        </div>

        {loggedIn ? (
          <Link href="/write?kind=story" onClick={onClose} className="btn btn-brick min-h-14 text-[26px]">
            {t("mobileMenu.leaveStory")}
          </Link>
        ) : (
          <button type="button" onClick={needLogin("/write?kind=story")} className="btn btn-brick min-h-14 text-[26px]">
            {t("mobileMenu.leaveStory")}
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
              {t("mobileMenu.logout")}
            </button>
          )}
          <div className="flex flex-wrap gap-x-3.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
            <Link href="/notices" onClick={onClose}>{t("mobileMenu.notices")}</Link>
            <Link href="/inquiry" onClick={onClose}>{t("mobileMenu.inquiry")}</Link>
            <Link href="/terms">{t("mobileMenu.terms")}</Link>
            <Link href="/privacy">{t("mobileMenu.privacy")}</Link>
            <a href="https://www.instagram.com/letter_251109/" target="_blank" rel="noopener noreferrer">{t("mobileMenu.instagram")}</a>
          </div>
        </div>
      </nav>
    </>
  );
}
