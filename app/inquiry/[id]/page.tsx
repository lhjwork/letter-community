import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyInquiry } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { WRAP } from "@/app/letter-box/parts";
import { CATEGORY_KEY } from "../status";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("inquiry.meta"))("detail") };
}

const ymd = (iso: string) => {
  const d = seoulParts(iso);
  return `${d.yyyy}.${d.mm}.${d.dd} · ${d.wd}`;
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("inquiry");
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect(`/?login=/inquiry/${encodeURIComponent(id)}`);
  const q = await getMyInquiry(id, token).catch(() => null);
  if (!q) notFound();

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-3 mobile-down:pt-1`}>
        <Link href="/inquiry" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          {t("detail.back")}
        </Link>
      </section>

      <section className={`${WRAP} flex flex-col items-center gap-14 pb-24 pt-6 mobile-down:gap-10 mobile-down:pb-12 mobile-down:pt-3`}>
        <article className="paper ruled flex w-full max-w-[760px] -rotate-[0.4deg] flex-col px-14 py-[72px] mobile-down:px-5 mobile-down:py-9">
          <span className="stampbox absolute -top-4 left-7 bg-paper text-airblue mobile-down:left-4 mobile-down:text-[22px]">{t("detail.mine")}</span>
          <p className="m-0 flex h-9 items-center text-[15px] text-ink-2">{CATEGORY_KEY[q.category] ? t(`categories.${CATEGORY_KEY[q.category]}`) : q.category}</p>
          <h1 className="m-0 font-pen text-[34px] font-normal leading-9 mobile-down:text-[28px]">{q.title}</h1>
          <p className="m-0 h-9 font-anton text-xs leading-9 tracking-[0.1em] text-ink-3">{ymd(q.createdAt)}</p>
          <div className="mt-9 whitespace-pre-line break-words break-keep text-[19px] leading-9 text-ink">{q.content}</div>
        </article>

        {q.answer ? (
          <article className="paper ruled flex w-full max-w-[760px] rotate-[0.3deg] flex-col px-14 py-[72px] mobile-down:px-5 mobile-down:py-9">
            <span aria-hidden="true" className="stampbox absolute -top-4 left-7 bg-paper text-brick mobile-down:left-4 mobile-down:text-[22px]">{t("detail.answer")}</span>
            <h2 className="sr-only">{t("detail.answer")}</h2>
            {q.answeredAt && <p className="m-0 h-9 font-anton text-xs leading-9 tracking-[0.1em] text-ink-3">{ymd(q.answeredAt)}</p>}
            <div className="whitespace-pre-line break-words break-keep text-[19px] leading-9 text-ink">{q.answer}</div>
            <p className="m-0 mt-9 self-end font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-2xl">{t("detail.from")}</p>
          </article>
        ) : (
          <p className="m-0 text-center font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-[22px]">{t("detail.waiting")}</p>
        )}
      </section>
    </main>
  );
}
