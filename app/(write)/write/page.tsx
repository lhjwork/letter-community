import { Suspense } from "react";
import WriteForm from "./WriteForm";

export const metadata = { title: "편지 쓰기" };

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

export default function WritePage() {
  return (
    <main>
      <section className={`${WRAP} flex flex-col gap-3 pb-10 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">천천히 써도 괜찮아요</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">편지 쓰기</h1>
      </section>
      <Suspense fallback={<p className={`${WRAP} pb-24 font-pen text-xl text-ink-3`}>불러오는 중...</p>}>
        <WriteForm />
      </Suspense>
    </main>
  );
}
