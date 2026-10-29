"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const NAMES = { ko: "한국어", en: "English", ja: "日本語" } as const;

function switchTo(code: string, pathname: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
  window.location.assign((pathname.replace(/^\/(en|ja)(?=\/|$)/, "") || "/") + window.location.search);
}

/** 언어 고르기. 쿠키를 바꾸고 접두어(/en, /ja) 없는 주소로 새로 불러온다(클라이언트 이동은 미리 받아 둔 다른 언어 화면을 재사용해서).
 *  open: 목록이 펼쳐지는 방향. 푸터는 위로, 모바일 메뉴는 제자리에 */
export default function LocaleSwitch({ className, open: dir = "down" }: { className?: string; open?: "down" | "up" | "inline" }) {
  const locale = useLocale() as keyof typeof NAMES;
  const t = useTranslations("common");
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (code: string) => {
    setOpen(false);
    if (code === locale) return;
    switchTo(code, pathname);
  };

  const place = dir === "inline" ? "" : `absolute right-0 z-50 min-w-36 shadow-[0_6px_18px_rgba(0,0,0,0.12)] ${dir === "up" ? "bottom-full mb-2" : "top-full mt-1"}`;

  return (
    <div ref={root} className={dir === "inline" ? "w-full" : "relative inline-flex"}>
      <button
        type="button"
        aria-label={t("language")}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`cursor-pointer gap-1.5 bg-transparent ${className ?? ""}`}
      >
        {NAMES[locale]}
        <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className={`m-0 list-none border-[1.5px] border-ink bg-paper p-1 ${place}`}>
          {Object.entries(NAMES).map(([code, name]) => (
            <li key={code}>
              <button
                type="button"
                lang={code}
                aria-current={code === locale ? "true" : undefined}
                onClick={() => pick(code)}
                className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-3 text-left font-pen text-xl hover:bg-cream ${code === locale ? "text-brick" : "text-ink"}`}
              >
                {name}
                {code === locale && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
