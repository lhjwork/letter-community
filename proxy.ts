import { auth } from "@/auth";
import { NextResponse } from "next/server";

// /en/... 는 같은 페이지를 영어로 보여 준다(검색에 영어 페이지를 따로 내보내려고). 라우트는 하나, 언어만 x-locale 로 넘긴다(next.config rewrites)
const EN_PREFIX = /^\/en(?=\/|$)/;

export const proxy = auth((req) => {
  const isEn = EN_PREFIX.test(req.nextUrl.pathname);
  const pathname = req.nextUrl.pathname.replace(EN_PREFIX, "") || "/";
  const isLoggedIn = !!req.auth;

  // 로그인이 필요한 페이지들
  const protectedRoutes = ["/write", "/drafts", "/my-page", "/letter-box", "/home", "/inquiry"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 로그인 전에 보호된 페이지로 오면 홈에서 로그인 창을 띄우고(LoginPrompt), 로그인 뒤 원래 주소로 돌려보낸다
  if (!isLoggedIn && isProtectedRoute) {
    const home = new URL(isEn ? "/en" : "/", req.url);
    home.searchParams.set("login", pathname + req.nextUrl.search);
    return NextResponse.redirect(home);
  }

  // 하위 경로(현재 경로·hreflang 용)와 언어를 서버 컴포넌트에 넘긴다
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  headers.delete("x-locale"); // 밖에서 보낸 값은 믿지 않는다
  if (!isEn) return NextResponse.next({ request: { headers } });

  headers.set("x-locale", "en");
  // 경로 연결(/en/x → /x)은 next.config 의 rewrites 가 한다. auth 가 req.nextUrl 을 AUTH_URL 로 바꿔 두어 여기서 rewrite 하면 외부 요청이 된다
  const res = NextResponse.next({ request: { headers } });
  // /en 으로 들어온 사람은 이후 일반 링크로 이동해도 영어로 이어 보게 한다
  res.cookies.set("NEXT_LOCALE", "en", { path: "/", maxAge: 31536000, sameSite: "lax" });
  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
