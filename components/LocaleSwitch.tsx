"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

/** 한국어 ↔ English. 쿠키를 바꾸고 새로 그린다. /en/... 에서 한국어로 바꾸면 접두어 없는 주소로 옮긴다 */
export default function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  return (
    <button
      type="button"
      lang={locale === "ko" ? "en" : "ko"}
      aria-label={t("language")}
      className={className}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${locale === "ko" ? "en" : "ko"}; path=/; max-age=31536000; samesite=lax`;
        const ko = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
        // 클라이언트 이동은 미리 받아 둔 영어 화면을 재사용해서, 경로가 바뀔 때는 새로 불러온다
        if (ko !== pathname) window.location.assign(ko + window.location.search);
        else router.refresh();
      }}
    >
      {t("switchTo")}
    </button>
  );
}
