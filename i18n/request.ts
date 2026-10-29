import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "NEXT_LOCALE";

// 화면 영역별 문구 파일. 새 영역을 만들면 messages/{ko,en}/<이름>.json 을 같이 만들고 여기에 추가
const NAMESPACES = ["common", "shared", "landing", "letter", "write", "letterBox", "myPage", "inquiry", "notices", "legal", "errors"] as const;

// ponytail: URL 은 그대로 두고 쿠키 → 브라우저 언어 순으로 고른다. 영어 페이지를 검색에 따로 내보낼 때 /en 경로로 올린다
export default getRequestConfig(async () => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const accept = (await headers()).get("accept-language") ?? "";
  const locale: Locale =
    fromCookie === "ko" || fromCookie === "en" ? fromCookie : /^\s*ko\b/i.test(accept) || !/^\s*en\b/i.test(accept) ? "ko" : "en";

  const parts = await Promise.all(NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`).then((m) => [ns, m.default] as const)));
  return { locale, messages: Object.fromEntries(parts) };
});
