"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginDialog from "./LoginDialog";

/** ?login=<돌아갈 경로>(&expired=1) 이면 로그인 창을 연다. proxy(보호 페이지)·세션 만료가 이 주소로 보낸다 */
export default function LoginPrompt() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const raw = params.get("login");
  // 같은 사이트 경로만(//evil.com 같은 외부 이동 방지)
  const back = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
  const expired = params.get("expired") === "1";

  // 이미 로그인한 상태로 이 주소에 오면 바로 원래 페이지로
  useEffect(() => {
    if (back && status === "authenticated") router.replace(back);
  }, [back, status, router]);

  if (!back || status !== "unauthenticated") return null;

  return (
    <LoginDialog
      isOpen
      onClose={() => router.replace(pathname)}
      callbackUrl={back}
      title={
        expired ? (
          <>
            로그인이 만료됐어요
            <br />
            다시 로그인해 주세요
          </>
        ) : (
          <>
            로그인하면
            <br />
            바로 이어서 볼 수 있어요
          </>
        )
      }
    />
  );
}
