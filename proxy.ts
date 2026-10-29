import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { lookup } from "geoip-country";

// /en/..., /ja/... 는 같은 페이지를 그 언어로 보여 준다(검색에 언어별 페이지를 따로 내보내려고). 라우트는 하나, 언어만 x-locale 로 넘긴다(next.config rewrites)
const PREFIX = /^\/(en|ja)(?=\/|$)/;
// i18n/request.ts 의 LOCALES·LOCALE_COOKIE 와 같게(그 파일은 next-intl 서버 코드라 proxy 에서 불러오지 않는다)
const LOCALES = ["ko", "en", "ja"] as const;
type Locale = (typeof LOCALES)[number];
const LOCALE_COOKIE = "NEXT_LOCALE";
const EN_COUNTRIES = new Set(["US", "GB", "CA", "AU", "NZ", "IE"]);
// 검색 로봇은 주로 미국 IP 라 IP 로 언어를 고르면 접두어 없는 한국어 페이지가 영어로 색인된다
const BOT = /bot|crawl|spider|slurp|yeti|daum|facebookexternalhit|kakaotalk-scrap/i;

/** 경로 접두어 → 쿠키 → 접속 국가(영어권 en, 일본 ja) → ko */
function pickLocale(prefix: string | undefined, cookie: string | undefined, ua: string, ip: string | undefined): Locale {
  if (prefix) return prefix as Locale;
  if (LOCALES.includes(cookie as Locale)) return cookie as Locale;
  if (!ip || BOT.test(ua)) return "ko";
  const country = lookup(ip)?.country;
  return country === "JP" ? "ja" : country && EN_COUNTRIES.has(country) ? "en" : "ko";
}

export const proxy = auth((req) => {
  const prefix = req.nextUrl.pathname.match(PREFIX)?.[1];
  const pathname = req.nextUrl.pathname.replace(PREFIX, "") || "/";
  const isLoggedIn = !!req.auth;

  // 로그인이 필요한 페이지들
  const protectedRoutes = ["/write", "/drafts", "/my-page", "/letter-box", "/home", "/inquiry"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 로그인 전에 보호된 페이지로 오면 홈에서 로그인 창을 띄우고(LoginPrompt), 로그인 뒤 원래 주소로 돌려보낸다
  if (!isLoggedIn && isProtectedRoute) {
    const home = new URL(prefix ? `/${prefix}` : "/", req.url);
    home.searchParams.set("login", pathname + req.nextUrl.search);
    return NextResponse.redirect(home);
  }

  // nginx 가 X-Real-IP 를 단다. 언어 고르기에만 쓰니 위조돼도 상관없다
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const locale = pickLocale(prefix, req.cookies.get(LOCALE_COOKIE)?.value, req.headers.get("user-agent") ?? "", ip);

  // 하위 경로(현재 경로·hreflang 용)와 언어를 서버 컴포넌트에 넘긴다. 밖에서 보낸 x-locale 은 덮어쓴다
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  headers.set("x-locale", locale);
  // 경로 연결(/en/x → /x)은 next.config 의 rewrites 가 한다. auth 가 req.nextUrl 을 AUTH_URL 로 바꿔 두어 여기서 rewrite 하면 외부 요청이 된다
  const res = NextResponse.next({ request: { headers } });
  // 접두어로 들어온 사람은 이후 일반 링크로 이동해도 그 언어로 이어 보게 한다
  if (prefix) res.cookies.set(LOCALE_COOKIE, prefix, { path: "/", maxAge: 31536000, sameSite: "lax" });
  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
