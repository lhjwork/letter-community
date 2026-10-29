import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "NEXT_LOCALE";

// 화면 영역별 문구 파일. 새 영역을 만들면 messages/{ko,en}/<이름>.json 을 같이 만들고 여기에 추가
const NAMESPACES = ["common", "shared", "landing", "letter", "write", "letterBox", "myPage", "inquiry", "notices", "legal", "errors"] as const;

export default getRequestConfig(async () => {
  const h = await headers();
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const accept = h.get("accept-language") ?? "";
  // /en 경로(proxy 가 x-locale 을 단다)가 가장 우선. 그다음 쿠키 → 브라우저 언어
  const locale: Locale =
    h.get("x-locale") === "en" ? "en" : fromCookie === "ko" || fromCookie === "en" ? fromCookie : /^\s*ko\b/i.test(accept) || !/^\s*en\b/i.test(accept) ? "ko" : "en";

  const parts = await Promise.all(NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`).then((m) => [ns, m.default] as const)));
  return { locale, messages: Object.fromEntries(parts) };
});
