"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
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
              앗, 문제가 생겼어요
            </p>
            <p
              style={{
                color: "#757575",
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              일시적인 오류가 발생했습니다.
              <br />
              잠시 후 다시 시도해주세요.
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
              다시 시도
            </button>
            <a
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
              홈으로
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
