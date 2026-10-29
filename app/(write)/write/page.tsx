import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import WriteForm from "./WriteForm";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const t = await getTranslations("write.meta");
  return { title: kind === "story" ? t("story") : t("friend") };
}

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** 제목(편지 쓰기 / 사연 남기기)은 종류 선택을 따라 바뀌어 WriteForm 이 그린다 */
export default function WritePage() {
  const t = useTranslations("write");
  return (
    <main>
      <Suspense fallback={<p className={`${WRAP} pb-24 pt-5 font-pen text-xl text-ink-3`}>{t("loading")}</p>}>
        <WriteForm />
      </Suspense>
    </main>
  );
}
