"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE] px-4">
      <div className="text-center max-w-md">
        <p
          className="text-[48px] text-[#4C261E] mb-4"
          style={{ fontFamily: "NanumJangMiCe, cursive" }}
        >
          앗, 문제가 생겼어요
        </p>
        <p className="text-[#757575] text-base mb-8">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#FF9883] text-white rounded-lg hover:bg-[#FF7F65] transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-[#C4C4C4] text-[#757575] rounded-lg hover:bg-gray-50 transition-colors"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
