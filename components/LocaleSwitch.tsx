"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

/** 한국어 ↔ English. 쿠키만 바꾸고 새로 그린다(i18n/request.ts 가 쿠키를 읽는다) */
export default function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <button
      type="button"
      lang={locale === "ko" ? "en" : "ko"}
      aria-label={t("language")}
      className={className}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${locale === "ko" ? "en" : "ko"}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
    >
      {t("switchTo")}
    </button>
  );
}
