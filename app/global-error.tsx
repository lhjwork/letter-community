"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// provider 바깥이라 next-intl 훅을 못 쓴다. 브라우저 언어로만 고르고, 서버 렌더는 한국어
const TEXT = {
  ko: { title: "앗, 문제가 생겼어요", line1: "일시적인 오류가 발생했습니다.", line2: "잠시 후 다시 시도해주세요.", retry: "다시 시도", home: "홈으로" },
  en: { title: "Oops, something went wrong", line1: "A temporary error occurred.", line2: "Please try again in a moment.", retry: "Try again", home: "Home" },
};
const noop = () => () => {};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useSyncExternalStore(noop, () => (navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en"), () => "ko" as const);
  const t = TEXT[lang];
  return (
    <html lang={lang}>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FEFEFE",
            padding: "1rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <p
              style={{
                fontSize: "48px",
                color: "#4C261E",
                marginBottom: "16px",
                fontFamily: "NanumJangMiCe, cursive",
              }}
            >
              {t.title}
            </p>
            <p
              style={{
                color: "#757575",
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              {t.line1}
              <br />
              {t.line2}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#FF9883",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "12px",
              }}
            >
              {t.retry}
            </button>
            <Link
              href="/"
              style={{
                padding: "12px 24px",
                border: "1px solid #C4C4C4",
                color: "#757575",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              {t.home}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
