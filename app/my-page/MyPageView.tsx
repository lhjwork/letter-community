import { seoulParts } from "@/lib/seoulDate";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRecordText } from "@/hooks/useRecordText";
import { FLOWS, TABS, type Flow, type Me, type MyRecords, type RecordItem, type Tab } from "./api";
import { NAME_CHANGE_MS, ymd } from "./date";
import LogoutButton from "./LogoutButton";
import NicknameForm from "./NicknameForm";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";
export const STEP = 6;
// 닉네임 변경은 30일에 한 번 (백엔드 userService NAME_CHANGE_INTERVAL_MS 와 같음). 잠겨 있으면 풀리는 시각
const unlockAt = (at?: string) => {
  const t = at ? new Date(at).getTime() + NAME_CHANGE_MS : 0;
  return t > Date.now() ? new Date(t).toISOString() : undefined;
};
export const MAX = 60; // ponytail: 더 보기는 60개까지, 넘으면 페이지 단위 목록이 필요
const TILT = ["-rotate-[0.6deg]", "rotate-[0.5deg]", "rotate-[0.4deg]", "-rotate-[0.7deg]", "rotate-[0.6deg]", "-rotate-[0.5deg]"];
const BADGE_BG = { blue: "bg-airblue", green: "bg-approve", brick: "bg-brick", muted: "bg-ink-3" } as const;

export default function MyPageView({ me, records, tab, flow, n }: { me: Me; records: MyRecords; tab: Tab; flow: Flow; n: number }) {
  const t = useTranslations("myPage");
  const locale = useLocale();
  const { counts } = records;
  const tabCount: Record<Tab, number> = { all: counts.sent + counts.received + counts.stories, sent: counts.sent, received: counts.received, stories: counts.stories };
  const href = (q: { tab?: Tab; flow?: Flow; n?: number }) => {
    const p = new URLSearchParams();
    const tb = q.tab ?? tab;
    const f = q.flow ?? flow;
    if (tb !== "all") p.set("tab", tb);
    if (f !== "all") p.set("flow", f);
    if (q.n) p.set("n", String(q.n));
    const s = p.toString();
    return s ? `/my-page?${s}` : "/my-page";
  };
  const providers = me.oauthAccounts.map((a) => a.provider.toUpperCase());
  const tabLabel = t(`tabs.${tab}`);

  return (
    <main>
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-9 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{t("eyebrow")}</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{t("title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5 mobile-down:hidden">
          <Link href="/letter-box" className="btn btn-blue">
            {t("toLetterBox")}
          </Link>
          <LogoutButton className="btn btn-ink" />
        </div>
      </section>

      <section className={`${WRAP} pb-12 mobile-down:pb-8`}>
        <div className="paper flex flex-wrap items-center gap-8 p-10 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-4 mobile-down:px-5 mobile-down:pb-6 mobile-down:pt-7 mobile-down:shadow-none">
          <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />

          <div className="mt-1.5 hidden min-w-0 flex-col gap-0.5 mobile-down:flex">
            <strong className="font-pen text-[28px] font-normal">{me.name}</strong>
            <span className="truncate text-[13px] text-ink-2">{me.email}</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-3">
              {providers.map((p) => (
                <span key={p} className="badge bg-ink">
                  {p}
                </span>
              ))}
              {t("joined", { date: ymd(me.createdAt, locale) })}
            </span>
          </div>

          <NicknameForm name={me.name} nameUpdatedAt={me.nameUpdatedAt} unlockAt={unlockAt(me.nameUpdatedAt)} />

          <dl className="m-0 grid flex-[1_1_260px] grid-cols-[auto_1fr] content-start gap-x-4 gap-y-2.5 text-[15px] mobile-down:hidden">
            <dt className="font-pen text-xl text-ink-3">{t("email")}</dt>
            <dd className="m-0 min-w-0 break-all">{me.email}</dd>
            <dt className="font-pen text-xl text-ink-3">{t("linkedAccounts")}</dt>
            <dd className="m-0 flex flex-wrap items-center gap-2">
              {providers.map((p) => (
                <span key={p} className="badge bg-ink">
                  {p}
                </span>
              ))}
              {t("joined", { date: ymd(me.createdAt, locale) })}
            </dd>
            <dt className="font-pen text-xl text-ink-3">{t("records")}</dt>
            <dd className="m-0">
              {t("recordsSummary", { sent: counts.sent, received: counts.received, stories: counts.stories, physical: counts.physical })}
            </dd>
          </dl>

          <dl className="m-0 hidden justify-between text-center mobile-down:flex">
            {[
              [t("short.sent"), counts.sent],
              [t("short.received"), counts.received],
              [t("short.stories"), counts.stories],
              [t("short.physical"), counts.physical],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-pen text-base text-ink-3">{k}</dt>
                <dd className="m-0 font-anton text-[22px] tracking-[0.1em]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${WRAP} pb-10 mobile-down:pb-6`}>
        <nav aria-label={t("tabsLabel")} className="flex flex-wrap border-b-2 border-ink mobile-down:flex-nowrap mobile-down:overflow-x-auto">
          {TABS.map((tb) => {
            const on = tb.value === tab;
            return (
              <Link
                key={tb.value}
                href={href({ tab: tb.value })}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-[52px] items-center whitespace-nowrap px-5 font-pen text-2xl hover:text-brick mobile-down:min-h-12 mobile-down:px-3.5 mobile-down:text-[21px] ${on ? "-mb-0.5 border-b-4 border-brick text-ink" : "text-ink-3"}`}
              >
                {t(`tabs.${tb.value}`)}
                <span className="ml-2 font-anton text-xs tracking-[0.1em] text-ink-3 mobile-down:ml-1.5 mobile-down:text-[11px]">{tabCount[tb.value]}</span>
              </Link>
            );
          })}
        </nav>
      </section>

      <section className={`${WRAP} flex flex-col gap-7 pb-24 mobile-down:gap-5 mobile-down:pb-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mobile-down:hidden">
          <h2 className="m-0 font-pen text-[32px] font-normal">{tabLabel}</h2>
          <div className="flex gap-2">
            {FLOWS.map((f) => (
              <Link key={f.value} href={href({ flow: f.value })} scroll={false} aria-current={f.value === flow ? "true" : undefined} className={`chip ${f.value === flow ? "chip-on" : ""}`}>
                {t(`flows.${f.value}`)}
              </Link>
            ))}
          </div>
        </div>

        {records.data.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="m-0 font-pen text-2xl text-ink-2">{t("empty")}</p>
            <Link href="/write" className="btn btn-brick">
              {t("write")}
            </Link>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6 p-0 mobile-down:gap-5">
            {records.data.map((r, i) => (
              <li key={r._id} className="flex">
                <RecordCard r={r} tilt={TILT[i % TILT.length]} />
              </li>
            ))}
          </ul>
        )}

        {records.total > records.data.length && n < MAX && (
          <Link href={href({ n: n + STEP })} scroll={false} className="btn btn-ink self-center">
            {t("more")}
          </Link>
        )}
        {records.total > records.data.length && n >= MAX && <p className="m-0 self-center text-[13px] text-ink-3">{t("limit", { max: MAX })}</p>}
      </section>

      <section className={`${WRAP} hidden pb-12 mobile-down:block`}>
        <LogoutButton className="btn min-h-12 w-full border-rule text-xl text-ink-3" />
      </section>
    </main>
  );
}

function RecordCard({ r, tilt }: { r: RecordItem; tilt: string }) {
  const rt = useRecordText();
  const labelColor = r.flow === "heart" ? "text-airblue" : r.label === "보낸 · 답장" ? "text-ink" : "text-brick";
  const d = seoulParts(r.createdAt);
  return (
    <Link href={`/letter/${r._id}`} className={`card w-full text-ink hover:text-ink ${tilt}`}>
      <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mt-1 flex items-start justify-between gap-2">
        <span className={`font-pen text-lg leading-none ${labelColor}`}>{rt.label(r.label)}</span>
        {r.badge && <span className={`badge ${BADGE_BG[r.badge.tone]}`}>{rt.badge(r.badge.text)}</span>}
      </div>
      {r.recipientName && <span className="mt-2 font-pen text-lg leading-9 text-brick">To. {r.recipientName}</span>}
      <strong className={`font-pen text-[26px] font-normal leading-9 ${r.recipientName ? "" : "mt-2"}`}>{rt.title(r.title)}</strong>
      <span className="mt-2 font-anton text-xs tracking-[0.1em] text-ink-3">
        {d.mm}.{d.dd} · {d.wd}
      </span>
    </Link>
  );
}
