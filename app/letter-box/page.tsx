import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StoryBrick } from "@/components/stories";
import { getMyLetters, getMyRequestSummary, getMyStories, type Letter, type MyRequestSummary } from "@/lib/api";
import { getAddresses } from "@/lib/address-api";
import { seoulParts } from "@/lib/seoulDate";
import type { Address } from "@/types/address";
import { useRecordText } from "@/hooks/useRecordText";
import { getMyRecords, type RecordItem } from "@/app/my-page/api";
import { Pager, RequestSteps, UnderLink, WRAP, region } from "./parts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("letterBox.meta"))("title") };
}

const LIMIT = 12;
const TILTS = ["-rotate-[0.6deg]", "rotate-[0.5deg]", "rotate-[0.4deg]"];

type Search = Promise<{ tab?: string; page?: string }>;

export default async function LetterBoxPage({ searchParams }: { searchParams: Search }) {
  const t = await getTranslations("letterBox");
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/");

  const sp = await searchParams;
  const tab = sp.tab === "stories" ? "stories" : sp.tab === "replies" ? "replies" : "letters";
  const page = Math.max(1, Number(sp.page) || 1);
  const lp = tab === "letters" ? page : 1;
  const stp = tab === "stories" ? page : 1;

  // 받은 답장 = 내 사연에 온 레터의 답장 + 채택된 답장(마이페이지 "받은 편지 · 사연"과 같은 데이터)
  // ponytail: 최근 60통까지(API 상한), 쪽 이동은 그보다 많아지면
  // 실패해도 화면은 그리되, 원인은 서버 로그에 남긴다
  const fail = <T,>(what: string, fallback: T) => (e: unknown) => (console.error(`[letter-box] ${what}:`, e), fallback);
  const [letters, stories, summary, addresses, replies] = await Promise.all([
    getMyLetters(token, { filter: "sent", page: lp, limit: LIMIT }).catch(fail("letters", null)),
    getMyStories(token, { page: stp, limit: LIMIT }).catch(fail("stories", null)),
    getMyRequestSummary(token).then((r) => r.data).catch(fail("requests", null)),
    getAddresses(token).then((r) => r.data ?? []).catch(fail("addresses", [] as Address[])),
    getMyRecords(token, "received", "story", 60).catch(fail("replies", null)),
  ]);
  const current = tab === "letters" ? letters : tab === "stories" ? stories : replies ? { data: replies.data, pagination: { totalPages: 1 } } : null;
  const heading = t(`home.tabs.${tab}`);

  const tabCls = "inline-flex min-h-[52px] items-center whitespace-nowrap px-5 font-pen text-2xl mobile-down:min-h-12 mobile-down:px-3.5 mobile-down:text-[21px]";
  const subLinks = (
    <>
      <UnderLink href="/letter-box/likes">{t("home.likes")}</UnderLink>
      <UnderLink href="/drafts">{t("home.drafts")}</UnderLink>
    </>
  );

  return (
    <main>
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-9 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{t("home.eyebrow")}</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{t("home.title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5 mobile-down:hidden">
          <Link href="/write?kind=story" className="btn btn-brick">
            {t("home.newStory")}
          </Link>
          <Link href="/write" className="btn btn-blue">
            {t("home.newLetter")}
          </Link>
        </div>
      </section>

      <section className={`${WRAP} pb-10 mobile-down:pb-6`}>
        <nav aria-label={t("home.tabsLabel")} className="flex flex-wrap border-b-2 border-ink">
          {(
            [
              ["letters", t("home.tabs.letters"), letters?.pagination.total],
              ["stories", t("home.tabs.stories"), stories?.pagination.total],
              ["replies", t("home.tabs.replies"), replies?.total],
            ] as const
          ).map(([key, label, n]) => (
            <Link
              key={key}
              href={key === "letters" ? "/letter-box" : `/letter-box?tab=${key}`}
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
            {t("loadFailed")}
          </p>
        ) : current.data.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="m-0 font-pen text-2xl text-ink-2">{t(`home.empty.${tab}`)}</p>
            <Link href={tab === "letters" ? "/write" : "/write?kind=story"} className={`btn ${tab === "letters" ? "btn-blue" : "btn-brick"}`}>
              {tab === "letters" ? t("home.newLetter") : t("home.newStory")}
            </Link>
          </div>
        ) : tab === "letters" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6 mobile-down:gap-5">
            {letters!.data.map((l, i) => (
              <LetterCard key={l._id} letter={l} tilt={TILTS[i % TILTS.length]} />
            ))}
          </div>
        ) : tab === "replies" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6 mobile-down:gap-5">
            {replies!.data.map((r, i) => (
              <ReceivedReplyCard key={r._id} item={r} tilt={TILTS[i % TILTS.length]} />
            ))}
          </div>
        ) : (
          <div className="[column-gap:28px] [columns:3_300px] mobile-down:columns-1">
            {stories!.data.map((s, i) => (
              <StoryBrick key={s._id} story={s} index={i} />
            ))}
          </div>
        )}
        {current && <Pager page={page} totalPages={current.pagination.totalPages} href={(p) => `/letter-box?${tab === "letters" ? "" : `tab=${tab}&`}page=${p}`} />}
        <p className="m-0 hidden flex-wrap gap-5 text-[15px] mobile-down:flex">{subLinks}</p>
      </section>

      <section className={`${WRAP} flex flex-wrap gap-6 pb-24 mobile-down:flex-col mobile-down:gap-4 mobile-down:pb-12`}>
        <RequestBlock summary={summary} />
        <div className="flex flex-[1_1_380px] flex-col gap-3.5 border border-rule bg-paper p-8 mobile-down:hidden">
          <h2 className="m-0 font-pen text-[32px] font-normal">{t("home.addressBook")}</h2>
          {addresses.length === 0 ? (
            <p className="m-0 text-[15px] leading-[1.8] text-ink-2">{t("home.noAddresses")}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0 text-[15px]">
              {addresses.slice(0, 3).map((a) => (
                <li key={a._id} className="flex min-h-11 items-center justify-between gap-2 border-b border-rule">
                  <span>
                    {a.recipientName} · {region(a.address)}
                  </span>
                  {a.isDefault && <span className="font-pen text-base text-ink-3">{t("home.default")}</span>}
                </li>
              ))}
            </ul>
          )}
          <Link href="/letter-box/addresses" className="btn btn-ink min-h-11 self-start text-xl">
            {t("home.manageAddresses")}
          </Link>
        </div>
        <Link href="/letter-box/addresses" className="btn btn-ink hidden min-h-12 text-[22px] mobile-down:inline-flex">
          {t("home.manageAddresses")}
        </Link>
      </section>
    </main>
  );
}

/** 마음 편지·사연 답장 카드. 답장은 "‘사연 제목’에 쓴 답장" */
function LetterCard({ letter, tilt }: { letter: Letter; tilt: string }) {
  const t = useTranslations("letterBox.card");
  const d = seoulParts(letter.createdAt);
  const reply = letter.replyTo;
  return (
    <Link href={`/letter/${letter._id}`} className={`card text-ink hover:text-ink mobile-down:px-5 mobile-down:pb-5 mobile-down:pt-6 ${tilt}`}>
      <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mt-1 flex min-h-5 items-start justify-between gap-2">
        {/* 배지는 기록된 사실만: 채택(답장) · 실물 신청됨(마음 편지) */}
        {reply ? (
          <>
            <span className="font-pen text-lg leading-none text-ink-3">{t("reply")}</span>
            {letter.adoptedAt && <span className="badge bg-approve">{t("adopted")}</span>}
          </>
        ) : (
          <>
            <span className="font-pen text-lg leading-none text-airblue">{t("heart")}</span>
            {letter.physicalRequested && <span className="badge bg-approve">{t("physicalRequested")}</span>}
          </>
        )}
      </div>
      {letter.recipientName && <span className="mt-2 font-pen text-lg leading-9 text-brick">To. {letter.recipientName}</span>}
      <strong className={`font-pen text-[26px] font-normal leading-9 ${letter.recipientName ? "" : "mt-2"}`}>{reply ? t("replyTo", { title: reply.title || t("story") }) : letter.title || t("untitled")}</strong>
      <span className="mt-2 font-anton text-xs tracking-[0.1em] text-ink-3">
        {d.mm}.{d.dd} · {d.wd}
      </span>
    </Link>
  );
}

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const TONE: Record<string, string> = { brick: "bg-brick", green: "bg-approve", blue: "bg-airblue", muted: "bg-ink-3" };

/** 받은 답장 카드: "‘사연 제목’에 온 답장" + 레터의 답장/채택 + 실물 신청됨. 누르면 답장 읽기 화면 */
function ReceivedReplyCard({ item, tilt }: { item: RecordItem; tilt: string }) {
  const t = useTranslations("letterBox.card");
  const rt = useRecordText();
  const d = seoulParts(item.createdAt);
  return (
    <Link href={`/letter/${item._id}`} className={`card text-ink hover:text-ink mobile-down:px-5 mobile-down:pb-5 mobile-down:pt-6 ${tilt}`}>
      <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mt-1 flex min-h-5 items-start justify-between gap-2">
        <span className="font-pen text-lg leading-none text-ink-3">{t("reply")}</span>
        <span className="flex flex-wrap justify-end gap-1.5">
          {item.badge && <span className={`badge ${TONE[item.badge.tone]}`}>{rt.badge(item.badge.text)}</span>}
          {item.physical && <span className="badge bg-approve">{t("physicalRequested")}</span>}
        </span>
      </div>
      <strong className="mt-2 font-pen text-[26px] font-normal leading-9">{t("replyFrom", { title: cut(item.storyTitle || t("story"), 14) })}</strong>
      <span className="mt-2 font-anton text-xs tracking-[0.1em] text-ink-3">
        {d.mm}.{d.dd} · {d.wd}
      </span>
    </Link>
  );
}

/** 실물 편지 신청 현황: 내가 쓴 편지들에 들어온 신청 중 가장 최근 것 */
function RequestBlock({ summary }: { summary: MyRequestSummary | null }) {
  const t = useTranslations("letterBox.requests");
  const tEnv = useTranslations("letter.envelope");
  const r = summary?.latest;
  return (
    <div id="requests" className="relative flex scroll-mt-6 flex-[1_1_380px] flex-col gap-3.5 border border-rule bg-paper p-8 mobile-down:flex-none mobile-down:gap-3 mobile-down:px-5 mobile-down:pb-6 mobile-down:pt-7">
      <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
      <h2 className="m-0 mt-2 font-pen text-[32px] font-normal mobile-down:mt-1.5 mobile-down:text-[28px]">{t("title")}</h2>
      {r ? (
        <>
          <div className="flex flex-col gap-1.5 mobile-down:contents">
            <strong className="font-pen text-[22px] font-normal">{r.letterTitle}</strong>
            <span className="text-sm text-ink-2 mobile-down:text-[13px]">
              {t("requestedOn", { date: `${seoulParts(r.requestedAt).mm}.${seoulParts(r.requestedAt).dd}` })} · {r.region}
              {r.envelope && tEnv.has(r.envelope) && <span className="hidden mobile-down:inline"> · {t("envelope", { name: tEnv(r.envelope) })}</span>}
            </span>
          </div>
          <RequestSteps status={r.status} className="mt-1.5 mobile-down:mt-0" />
          <UnderLink href={`/letter/${r.letterId}#requests`} className="mt-1.5 self-start font-pen text-xl mobile-down:hidden">
            {t("view")}
          </UnderLink>
        </>
      ) : (
        <p className="m-0 text-[15px] leading-[1.8] text-ink-2">{summary ? t("none") : t("failed")}</p>
      )}
    </div>
  );
}
