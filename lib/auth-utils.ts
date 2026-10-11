import { signOut } from "next-auth/react";

/**
 * 토큰 만료 시 자동 로그아웃 처리
 */
export async function handleTokenExpiration() {
  // 브라우저 alert 대신: 홈에서 "로그인이 만료됐어요" 로그인 창(LoginPrompt)을 띄우고, 다시 로그인하면 보던 화면으로
  const back = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
  await signOut({ callbackUrl: `/?login=${encodeURIComponent(back)}&expired=1`, redirect: true });
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
