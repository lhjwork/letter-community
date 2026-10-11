import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNotice } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { WRAP } from "@/app/letter-box/parts";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const notice = await getNotice((await params).id).catch(() => null);
  return { title: notice ? `${notice.title} | 공지사항` : "공지사항" };
}

export default async function NoticePage({ params }: Params) {
  const notice = await getNotice((await params).id).catch(() => null);
  if (!notice) notFound();
  const d = seoulParts(notice.createdAt);

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-3 mobile-down:pt-1`}>
        <Link href="/notices" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          ← 공지사항 목록
        </Link>
      </section>

      <section className={`${WRAP} flex flex-col items-center pb-24 pt-6 mobile-down:pb-12 mobile-down:pt-3`}>
        <article className="paper ruled flex w-full max-w-[760px] -rotate-[0.4deg] flex-col px-14 py-[72px] mobile-down:px-5 mobile-down:py-9">
          <span className="stampbox absolute -top-4 left-7 bg-paper text-airblue mobile-down:left-4 mobile-down:text-[22px]">공지</span>
          <h1 className="m-0 font-pen text-[34px] font-normal leading-9 mobile-down:text-[28px]">{notice.title}</h1>
          <p className="m-0 h-9 font-anton text-xs leading-9 tracking-[0.1em] text-ink-3">
            {d.yyyy}.{d.mm}.{d.dd} · {d.wd}
          </p>
          <div className="mt-9 whitespace-pre-line break-words break-keep text-[19px] leading-9 text-ink">{notice.content}</div>
          <p className="m-0 mt-9 self-end font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-2xl">From. 레터</p>
        </article>
        <Link href="/notices" className="btn btn-ink mt-10 mobile-down:mt-8">
          목록으로
        </Link>
      </section>
    </main>
  );
}
