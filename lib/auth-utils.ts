import { signOut } from "next-auth/react";

/**
 * 토큰 만료 시 자동 로그아웃 처리
 */
export async function handleTokenExpiration() {
  // 사용자 친화적 메시지 표시
  if (typeof window !== "undefined") {
    alert("로그인 세션이 만료되었습니다.\n다시 로그인해 주세요.");

    // localStorage에서 토큰 제거
    localStorage.removeItem("authToken");
  }

  // NextAuth 세션 종료 및 메인 페이지로 리다이렉트
  await signOut({
    callbackUrl: "/",
    redirect: true,
  });
}

/**
 * API 응답에서 401 에러 체크 및 자동 로그아웃 처리
 */
export async function checkAuthError(response: Response) {
  if (response.status === 401) {
    console.log("토큰이 만료되었습니다. 자동 로그아웃 처리 중...");
    await handleTokenExpiration();
    throw new Error("Authentication expired");
  }
  return response;
}

/**
 * API 에러 처리 (catch 블록에서 사용)
 */
export async function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Authentication") || error.message.includes("401")) {
      await handleTokenExpiration();
      return;
    }
  }
  throw error;
}
