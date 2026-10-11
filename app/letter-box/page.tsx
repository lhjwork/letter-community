import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StoryBrick } from "@/components/stories";
import { getMyLetters, getMyRequestSummary, getMyStories, type Letter, type MyRequestSummary } from "@/lib/api";
import { getAddresses } from "@/lib/address-api";
import { seoulParts } from "@/lib/seoulDate";
import type { Address } from "@/types/address";
import { ENVELOPE_NAME } from "@/app/letter/[letterId]/friend/status";
import { Pager, RequestSteps, UnderLink, WRAP, region } from "./parts";

export const metadata: Metadata = { title: "우편함" };

const LIMIT = 12;
const TILTS = ["-rotate-[0.6deg]", "rotate-[0.5deg]", "rotate-[0.4deg]"];

type Search = Promise<{ tab?: string; page?: string }>;

export default async function LetterBoxPage({ searchParams }: { searchParams: Search }) {
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/");

  const sp = await searchParams;
  const tab = sp.tab === "stories" ? "stories" : "letters";
  const page = Math.max(1, Number(sp.page) || 1);
  const lp = tab === "letters" ? page : 1;
  const stp = tab === "stories" ? page : 1;

  const [letters, stories, summary, addresses] = await Promise.all([
    getMyLetters(token, { filter: "sent", page: lp, limit: LIMIT }).catch(() => null),
    getMyStories(token, { page: stp, limit: LIMIT }).catch(() => null),
    getMyRequestSummary(token).then((r) => r.data).catch(() => null),
    getAddresses(token).then((r) => r.data ?? []).catch(() => [] as Address[]),
  ]);
  const current = tab === "letters" ? letters : stories;
  const heading = tab === "letters" ? "내가 쓴 편지" : "내 사연";

  const tabCls = "inline-flex min-h-[52px] items-center whitespace-nowrap px-5 font-pen text-2xl mobile-down:min-h-12 mobile-down:px-3.5 mobile-down:text-[21px]";
  const subLinks = (
    <>
      <UnderLink href="/letter-box/likes">마음에 담은 사연</UnderLink>
      <UnderLink href="/drafts">임시저장</UnderLink>
    </>
  );

  return (
    <main>
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-9 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">내가 쓴 편지와 사연이 여기 모여요</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">우편함</h1>
        </div>
        <div className="flex flex-wrap gap-2.5 mobile-down:hidden">
          <Link href="/write?kind=story" className="btn btn-brick">
            사연 남기기
          </Link>
          <Link href="/write" className="btn btn-blue">
            편지 쓰기
          </Link>
        </div>
      </section>

      <section className={`${WRAP} pb-10 mobile-down:pb-6`}>
        <nav aria-label="우편함 구분" className="flex flex-wrap border-b-2 border-ink">
          {(
            [
              ["letters", "내가 쓴 편지", letters?.pagination.total],
              ["stories", "내 사연", stories?.pagination.total],
            ] as const
          ).map(([key, label, n]) => (
            <Link
              key={key}
              href={key === "letters" ? "/letter-box" : "/letter-box?tab=stories"}
              aria-current={tab === key ? "page" : undefined}
              className={`${tabCls} ${tab === key ? "-mb-0.5 border-b-4 border-brick text-ink" : "text-ink-3"} hover:text-brick`}
            >
              {label}
              {n != null && <span className="ml-2 font-anton text-xs tracking-[0.1em] text-ink-3">{n}</span>}
            </Link>
          ))}
        </nav>
      </section>

      <section className={`${WRAP} flex flex-col gap-7 pb-16 mobile-down:gap-5 mobile-down:pb-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mobile-down:hidden">
          <h2 className="m-0 font-pen text-[32px] font-normal">{heading}</h2>
          <p className="m-0 flex flex-wrap gap-5 text-[15px]">{subLinks}</p>
        </div>
        <h2 className="sr-only hidden mobile-down:block">{heading}</h2>

        {current === null ? (
          <p role="alert" className="m-0 py-12 font-pen text-2xl text-brick">
            목록을 불러오지 못했어요.
          </p>
        ) : current.data.length === 0 ? (
          <p className="m-0 py-6 font-pen text-2xl text-ink-2">{tab === "letters" ? "아직 쓴 편지가 없어요." : "아직 남긴 사연이 없어요."}</p>
        ) : tab === "letters" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6 mobile-down:gap-5">
            {letters!.data.map((l, i) => (
              <LetterCard key={l._id} letter={l} tilt={TILTS[i % TILTS.length]} />
            ))}
          </div>
        ) : (
          <div className="[column-gap:28px] [columns:3_300px] mobile-down:columns-1">
            {stories!.data.map((s, i) => (
              <StoryBrick key={s._id} story={s} index={i} />
            ))}
          </div>
        )}
        {current && <Pager page={page} totalPages={current.pagination.totalPages} href={(p) => `/letter-box?${tab === "stories" ? "tab=stories&" : ""}page=${p}`} />}
        <p className="m-0 hidden flex-wrap gap-5 text-[15px] mobile-down:flex">{subLinks}</p>
      </section>

      <section className={`${WRAP} flex flex-wrap gap-6 pb-24 mobile-down:flex-col mobile-down:gap-4 mobile-down:pb-12`}>
        <RequestBlock summary={summary} />
        <div className="flex flex-[1_1_380px] flex-col gap-3.5 border border-rule bg-paper p-8 mobile-down:hidden">
          <h2 className="m-0 font-pen text-[32px] font-normal">주소록</h2>
          {addresses.length === 0 ? (
            <p className="m-0 text-[15px] leading-[1.8] text-ink-2">저장한 주소가 없어요.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0 text-[15px]">
              {addresses.slice(0, 3).map((a) => (
                <li key={a._id} className="flex min-h-11 items-center justify-between gap-2 border-b border-rule">
                  <span>
                    {a.recipientName} · {region(a.address)}
                  </span>
                  {a.isDefault && <span className="font-pen text-base text-ink-3">기본</span>}
                </li>
              ))}
            </ul>
          )}
          <Link href="/letter-box/addresses" className="btn btn-ink min-h-11 self-start text-xl">
            수신자 주소 관리
          </Link>
        </div>
        <Link href="/letter-box/addresses" className="btn btn-ink hidden min-h-12 text-[22px] mobile-down:inline-flex">
          수신자 주소 관리
        </Link>
      </section>
    </main>
  );
}

/** 마음 편지·사연 답장 카드. 답장은 "‘사연 제목’에 쓴 답장" */
function LetterCard({ letter, tilt }: { letter: Letter; tilt: string }) {
  const d = seoulParts(letter.createdAt);
  const reply = letter.replyTo;
  return (
    <Link href={`/letter/${letter._id}`} className={`card text-ink hover:text-ink mobile-down:px-5 mobile-down:pb-5 mobile-down:pt-6 ${tilt}`}>
      <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mt-1 flex min-h-5 items-start justify-between gap-2">
        {/* 배지는 기록된 사실만: 채택(답장) · 실물 신청됨(마음 편지) */}
        {reply ? (
          <>
            <span className="font-pen text-lg leading-none text-ink-3">사연 답장</span>
            {letter.adoptedAt && <span className="badge bg-approve">채택</span>}
          </>
        ) : (
          <>
            <span className="font-pen text-lg leading-none text-airblue">마음 편지</span>
            {letter.physicalRequested && <span className="badge bg-approve">실물 신청됨</span>}
          </>
        )}
      </div>
      {letter.recipientName && <span className="mt-2 font-pen text-lg leading-9 text-brick">To. {letter.recipientName}</span>}
      <strong className={`font-pen text-[26px] font-normal leading-9 ${letter.recipientName ? "" : "mt-2"}`}>{reply ? `‘${reply.title || "사연"}’에 쓴 답장` : letter.title || "제목 없음"}</strong>
      <span className="mt-2 font-anton text-xs tracking-[0.1em] text-ink-3">
        {d.mm}.{d.dd} · {d.wd}
      </span>
    </Link>
  );
}

/** 실물 편지 신청 현황: 내가 쓴 편지들에 들어온 신청 중 가장 최근 것 */
function RequestBlock({ summary }: { summary: MyRequestSummary | null }) {
  const r = summary?.latest;
  return (
    <div className="relative flex flex-[1_1_380px] flex-col gap-3.5 border border-rule bg-paper p-8 mobile-down:flex-none mobile-down:gap-3 mobile-down:px-5 mobile-down:pb-6 mobile-down:pt-7">
      <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
      <h2 className="m-0 mt-2 font-pen text-[32px] font-normal mobile-down:mt-1.5 mobile-down:text-[28px]">실물 편지 신청 현황</h2>
      {r ? (
        <>
          <div className="flex flex-col gap-1.5 mobile-down:contents">
            <strong className="font-pen text-[22px] font-normal">{r.letterTitle}</strong>
            <span className="text-sm text-ink-2 mobile-down:text-[13px]">
              {seoulParts(r.requestedAt).mm}.{seoulParts(r.requestedAt).dd} 신청 · {r.region}
              {r.envelope && ENVELOPE_NAME[r.envelope] && <span className="hidden mobile-down:inline"> · {ENVELOPE_NAME[r.envelope]} 봉투</span>}
            </span>
          </div>
          <RequestSteps status={r.status} className="mt-1.5 mobile-down:mt-0" />
          <UnderLink href={`/letter/${r.letterId}`} className="mt-1.5 self-start font-pen text-xl mobile-down:hidden">
            신청 내역 보기
          </UnderLink>
        </>
      ) : (
        <p className="m-0 text-[15px] leading-[1.8] text-ink-2">{summary ? "아직 들어온 신청이 없어요." : "신청 현황을 불러오지 못했어요."}</p>
      )}
    </div>
  );
}
