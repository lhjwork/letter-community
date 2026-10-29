"use client";

import { track } from "@/lib/analytics/ga";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import LocaleSwitch from "@/components/LocaleSwitch";
import LoginDialog from "./LoginDialog";
import MobileSideMenu from "./MobileSideMenu";

export const NAV = [
  { href: "/write", key: "write" },
  { href: "/stories", key: "stories" },
  { href: "/letter-box", key: "letterBox" },
] as const;

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
export function todayLabel(locale: string, d = new Date()) {
  if (locale !== "ko") return d.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${DAYS[d.getDay()]}`;
}

/** 지금 있는 섹션의 NAV href. /letter/* 는 사연 상세로 본다 */
function currentSection(path: string) {
  if (path.startsWith("/letter-box")) return "/letter-box";
  if (path.startsWith("/stories") || path.startsWith("/letter/")) return "/stories";
  if (path.startsWith("/write")) return "/write";
  return null;
}

export default function Header() {
  const t = useTranslations("shared.header");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const current = currentSection((usePathname() ?? "").replace(/^\/(en|ja)(?=\/|$)/, ""));
  const loggedIn = status === "authenticated";
  const [loginCallbackUrl, setLoginCallbackUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openLoginDialog = (callbackUrl = "/") => {
    if (callbackUrl === "/write") track("write_cta_click", { from: "header", logged_in: false });
    setLoginCallbackUrl(callbackUrl);
  };

  // 로그인 전에는 보호 라우트 대신 로그인 모달. 보드 글자 크기·폰트는 그대로
  const navItem = (href: string, label: string, className: string) =>
    loggedIn || href === "/stories" ? (
      <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className={`${className} ${current === href ? "border-brick" : "border-transparent"}`}>
        {label}
      </Link>
    ) : (
      <button key={href} type="button" onClick={() => openLoginDialog(href)} className={`${className} cursor-pointer border-transparent bg-transparent`}>
        {label}
      </button>
    );

  return (
    <>
      {/* 데스크톱 헤더 */}
      <header className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 pb-[18px] pt-[22px] mobile-down:hidden">
        <Link href={loggedIn ? "/home" : "/"} aria-label={t("home")} className="flex items-center gap-2">
          <Image src="/v8/logo.png" alt="" width={66} height={44} className="h-11 w-[66px] object-contain" priority />
          <span className="font-pen text-[34px] leading-none text-ink">Letter</span>
        </Link>
        <nav aria-label={t("mainMenu")} className="flex flex-wrap gap-[34px] font-pen text-[22px]">
          {NAV.map((n) => navItem(n.href, t(`nav.${n.key}`), "inline-flex min-h-11 items-center border-b-2 text-ink hover:text-brick"))}
        </nav>
        <div className="flex items-center gap-[18px]">
          <span className="font-pen text-lg text-ink-3" suppressHydrationWarning>
            {todayLabel(locale)}
          </span>
          {loggedIn ? (
            <Link href="/my-page" className="inline-flex min-h-11 items-center border-b-[1.5px] border-ink font-pen text-xl text-ink hover:text-brick">
              {session?.user?.name ?? t("myPage")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openLoginDialog("/")}
              className="inline-flex min-h-11 cursor-pointer items-center border-b-[1.5px] border-ink bg-transparent font-pen text-xl text-ink hover:text-brick"
            >
              {t("login")}
            </button>
          )}
          <LocaleSwitch className="inline-flex min-h-11 items-center font-pen text-xl text-ink hover:text-brick" />
        </div>
      </header>

      {/* 모바일 헤더 */}
      <header className="hidden w-full items-center justify-between gap-3 px-4 pb-2.5 pt-3 mobile-down:flex">
        <Link href={loggedIn ? "/home" : "/"} aria-label={t("home")} className="flex items-center gap-1.5">
          <Image src="/v8/logo.png" alt="" width={54} height={36} className="h-9 w-[54px] object-contain" priority />
          <span className="font-pen text-[30px] leading-none text-ink">Letter</span>
        </Link>
        <div className="flex items-center gap-1">
          {loggedIn ? (
            <Link href="/letter-box" aria-label={t("letterBox")} className="inline-flex h-11 w-11 items-center justify-center">
              <MailIcon />
            </Link>
          ) : (
            <button type="button" aria-label={t("letterBox")} onClick={() => openLoginDialog("/letter-box")} className="inline-flex h-11 w-11 items-center justify-center">
              <MailIcon />
            </button>
          )}
          <button type="button" aria-label={t("menu")} data-menu-button onClick={() => setIsMobileMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-ink">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <MobileSideMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onLoginClick={(href) => openLoginDialog(href)} />

      <LoginDialog isOpen={loginCallbackUrl !== null} onClose={() => setLoginCallbackUrl(null)} callbackUrl={loginCallbackUrl ?? "/"} />
    </>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="text-ink">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
