"use client";

import { startTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 서버 응답이 늦거나 실패했을 때(편지 상세 등이 throw). 다시 시도를 먼저 권한다
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <title>잠깐 길이 막혔어요</title>
      <div className="paper relative flex w-full max-w-[480px] flex-col items-center gap-4 border border-rule px-8 pb-10 pt-12 text-center mobile-down:px-5">
        <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
        <h1 className="m-0 font-pen text-[40px] font-normal leading-[1.3] mobile-down:text-[32px]">잠깐 길이 막혔어요</h1>
        <p className="m-0 text-base leading-[1.8] text-ink-2">화면을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.</p>
        <div className="mt-2 flex w-full gap-2.5 mobile-down:flex-col">
          <button type="button" onClick={() => startTransition(() => {
            // 서버 컴포넌트가 throw 한 경우 reset 만으로는 다시 불러오지 않는다 → 서버 데이터를 새로 받고 reset
            router.refresh();
            reset();
          })} className="btn btn-brick min-h-[52px] flex-1">
            다시 시도
          </button>
          <Link href="/" className="btn btn-ink min-h-[52px] flex-1">
            처음으로
          </Link>
        </div>
      </div>
    </main>
  );
}
