"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const NAMES = { ko: "한국어", en: "English", ja: "日本語" } as const;

/** 언어 고르기. 쿠키를 바꾸고 접두어(/en, /ja) 없는 주소로 새로 불러온다(클라이언트 이동은 미리 받아 둔 다른 언어 화면을 재사용해서) */
export default function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname() ?? "/";
  return (
    <select
      aria-label={t("language")}
      className={`cursor-pointer appearance-none bg-transparent ${className ?? ""}`}
      value={locale}
      onChange={(e) => {
        document.cookie = `NEXT_LOCALE=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
        window.location.assign((pathname.replace(/^\/(en|ja)(?=\/|$)/, "") || "/") + window.location.search);
      }}
    >
      {Object.entries(NAMES).map(([code, name]) => (
        <option key={code} value={code} lang={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
