import type { Metadata } from "next";
import Link from "next/link";
import { getNotices } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { Pager, WRAP } from "@/app/letter-box/parts";

export const metadata: Metadata = { title: "공지사항" };

const LIMIT = 20;

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const list = await getNotices(page, LIMIT).catch(() => null);

  return (
    <main>
      <section className={`${WRAP} flex flex-col gap-3 pb-9 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">레터가 전하는 소식</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">공지사항</h1>
      </section>

      <section className={`${WRAP} flex flex-col gap-10 pb-24 mobile-down:gap-8 mobile-down:pb-12`}>
        {!list ? (
          <p className="m-0 font-pen text-2xl text-ink-2">공지를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>
        ) : list.items.length === 0 ? (
          <p className="m-0 font-pen text-2xl text-ink-2">아직 올라온 공지가 없어요.</p>
        ) : (
          <ul className="m-0 list-none border-t-2 border-ink p-0">
            {list.items.map((n) => {
              const d = seoulParts(n.createdAt);
              return (
                <li key={n._id} className="border-b border-rule">
                  <Link href={`/notices/${n._id}`} className="flex min-h-[72px] items-center gap-4 px-2 py-3 text-ink hover:text-brick mobile-down:flex-wrap mobile-down:gap-x-3 mobile-down:gap-y-1 mobile-down:px-0">
                    {n.isPinned && <span className="badge shrink-0 bg-brick">고정</span>}
                    <span className="min-w-0 flex-1 font-pen text-[26px] leading-9 mobile-down:order-last mobile-down:basis-full mobile-down:text-2xl">{n.title}</span>
                    <span className="shrink-0 font-anton text-xs tracking-[0.1em] text-ink-3">
                      {d.yyyy}.{d.mm}.{d.dd}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {list && <Pager page={page} totalPages={list.pagination.totalPages} href={(p) => (p > 1 ? `/notices?page=${p}` : "/notices")} />}
      </section>
    </main>
  );
}
