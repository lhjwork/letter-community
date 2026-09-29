"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GA_ENABLED, GA_ID, pageview, setUser, track } from "@/lib/analytics/ga";

const IS_DEV = process.env.NODE_ENV !== "production";
const LOGIN_TRACKED_KEY = "ga_login_tracked";

/** 라우트 전환 페이지뷰 (App Router는 전체 로드가 아니라 수동 전송 필요) */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const qs = searchParams.toString();
    pageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);
  return null;
}

/** 로그인 사용자 → user_id / user_properties 동기화 + login 이벤트 1회 */
function UserSync() {
  const { data: session, status } = useSession();
  const prevStatus = useRef(status);
  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user?.id) {
      setUser({ id: session.user.id, provider: session.user.provider });
      try {
        if (!sessionStorage.getItem(LOGIN_TRACKED_KEY)) {
          sessionStorage.setItem(LOGIN_TRACKED_KEY, "1");
          track("login", { method: session.user.provider ?? "unknown" });
        }
      } catch {
        /* storage 차단 환경이면 login 이벤트만 생략 */
      }
    } else if (status === "unauthenticated") {
      setUser(null);
      if (prevStatus.current === "authenticated") {
        track("logout", {});
        try { sessionStorage.removeItem(LOGIN_TRACKED_KEY); } catch { /* noop */ }
      }
    }
    prevStatus.current = status;
  }, [status, session?.user?.id, session?.user?.provider]);
  return null;
}

export function GoogleAnalytics() {
  if (!GA_ENABLED) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false${IS_DEV ? ",debug_mode:true" : ""}});`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <UserSync />
    </>
  );
}
