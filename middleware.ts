import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 로그인이 필요한 페이지들
  const protectedRoutes = ["/write", "/my-page", "/home"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 로그인 전용 페이지들
  const afterLoginRoutes = pathname.startsWith("/(afterLogin)");

  // 로그인하지 않았는데 보호된 페이지 접근 시도
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 로그인했는데 루트 페이지 접근 시 (afterLogin)으로 리다이렉트
  // if (isLoggedIn && pathname === "/") {
  //   return NextResponse.redirect(new URL("/home", req.url));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
