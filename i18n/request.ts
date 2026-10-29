import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "NEXT_LOCALE";

// 화면 영역별 문구 파일. 새 영역을 만들면 messages/{ko,en,ja}/<이름>.json 을 같이 만들고 여기에 추가
const NAMESPACES = ["common", "shared", "landing", "letter", "write", "letterBox", "myPage", "inquiry", "notices", "legal", "errors"] as const;

export default getRequestConfig(async () => {
  // 언어는 proxy.ts 가 정해 x-locale 로 넘긴다(경로 → 쿠키 → 접속 국가). proxy 를 안 거친 요청은 한국어
  const x = (await headers()).get("x-locale");
  const locale: Locale = LOCALES.includes(x as Locale) ? (x as Locale) : "ko";

  const parts = await Promise.all(NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`).then((m) => [ns, m.default] as const)));
  return { locale, messages: Object.fromEntries(parts) };
});
