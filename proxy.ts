import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 로그인이 필요한 페이지들
  const protectedRoutes = ["/write", "/drafts", "/my-page", "/letter-box", "/home"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 로그인 전에 보호된 페이지로 오면 홈에서 로그인 창을 띄우고(LoginPrompt), 로그인 뒤 원래 주소로 돌려보낸다
  if (!isLoggedIn && isProtectedRoute) {
    const home = new URL("/", req.url);
    home.searchParams.set("login", pathname + req.nextUrl.search);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
