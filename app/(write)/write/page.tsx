import { Suspense } from "react";
import WriteForm from "./WriteForm";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return { title: kind === "story" ? "사연 남기기" : "편지 쓰기" };
}

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** 제목(편지 쓰기 / 사연 남기기)은 종류 선택을 따라 바뀌어 WriteForm 이 그린다 */
export default function WritePage() {
  return (
    <main>
      <Suspense fallback={<p className={`${WRAP} pb-24 pt-5 font-pen text-xl text-ink-3`}>불러오는 중...</p>}>
        <WriteForm />
      </Suspense>
    </main>
  );
}
