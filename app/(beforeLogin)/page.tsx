import Image from "next/image";
import Link from "next/link";
import AuthLink from "@/components/shareds/AuthLink";
import { getFeaturedStories, type Story } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { useTranslations } from "next-intl";

// 빌드 컨테이너에서는 backend에 접근 불가 → 프리렌더 금지. 데이터 캐시는 getFeaturedStories의 fetch revalidate가 담당
export const dynamic = "force-dynamic";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

export default async function LandingPage() {
  let stories: Story[] = [];
  try {
    stories = (await getFeaturedStories())?.data ?? [];
  } catch (error) {
    console.error("Featured stories 로드 실패:", error);
  }

  return (
    <main>
      <Hero />
      <TwoLetters />
      <WaitingStories stories={stories} />
      <LinkLetter />
      <PhysicalLetter />
      <Contact />
    </main>
  );
}

function Hero() {
  const t = useTranslations("landing.hero");
  const { mm, dd } = seoulParts(new Date().toISOString());
  const mmdd = `${mm}.${dd}`;
  return (
    <section className={`${WRAP} flex flex-wrap items-center gap-12 pb-[72px] pt-7 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-5 mobile-down:pb-10 mobile-down:pt-3`}>
      <div className="flex flex-1 basis-[420px] flex-col gap-[22px] mobile-down:contents">
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:order-1 mobile-down:text-xl">{t("eyebrow")}</p>
        <h1 className="m-0 font-pen text-[62px] font-normal leading-[1.25] mobile-down:order-2 mobile-down:text-[44px] mobile-down:leading-[1.2]">
          {t("title1")}
          <br />
          {t("title2")}
        </h1>
        <p className="m-0 max-w-[30em] text-[17px] leading-[1.9] text-ink-2 mobile-down:order-4 mobile-down:max-w-none mobile-down:text-[15px]">
          {t("body1")}
          <br className="mobile-down:hidden" />{t("body2")}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 mobile-down:order-5 mobile-down:mt-0 mobile-down:flex-col mobile-down:gap-2.5">
          <AuthLink href="/write?kind=story" className="btn btn-brick min-h-[52px] px-7 text-[26px] mobile-down:min-h-14 mobile-down:text-[28px]">
            {t("storyCta")}
          </AuthLink>
          <AuthLink href="/write" className="btn btn-blue min-h-[52px] px-6 text-[26px] mobile-down:min-h-[52px]">
            {t("writeCta")}
          </AuthLink>
        </div>
      </div>
      <div className="relative flex flex-1 basis-[460px] justify-center mobile-down:order-3 mobile-down:basis-auto mobile-down:px-2 mobile-down:pt-2">
        <Image
          src="/v8/hero-envelope.png"
          alt={t("imageAlt")}
          width={668}
          height={456}
          priority
          className="h-auto w-full max-w-[560px] -rotate-2 border border-rule shadow-[var(--paper-shadow)]"
        />
        <div
          aria-hidden="true"
          className="post absolute right-[6%] top-[-10px] h-[92px] w-[92px] rotate-[14deg] bg-cream/60 text-[13px] opacity-80 mobile-down:right-0 mobile-down:top-[-8px] mobile-down:h-[72px] mobile-down:w-[72px] mobile-down:text-[11px]"
        >
          SEOUL<span className="text-lg mobile-down:text-[15px]">26</span>
          {mmdd}
        </div>
      </div>
    </section>
  );
}

// 단계 문구는 landing.twoLetters.<kind>.steps 의 { desktop, mobile } — v8-TwoLetters / M-Home 보드 그대로.
// 강조 표시: *빨강(사연·레터)* _파랑(마음 편지·받는 사람)_ +초록(종이 편지)+
const MARK: Record<string, string> = { "*": "text-brick", _: "text-airblue", "+": "text-approve" };

/** STEPS 문구의 강조 표시를 색 글자로 */
function Marked({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*|_[^_]+_|\+[^+]+\+)/).map((part, i) =>
    MARK[part[0]] && part.length > 2 && part.at(-1) === part[0] ? (
      <strong key={i} className={`font-normal ${MARK[part[0]]}`}>
        {part.slice(1, -1)}
      </strong>
    ) : (
      part
    ),
  );
}

function TwoLetters() {
  const t = useTranslations("landing.twoLetters");
  return (
    <section className={`${WRAP} flex flex-col gap-7 pb-24 mobile-down:pb-12`}>
      <h2 className="m-0 border-b-2 border-ink pb-3 font-pen text-[40px] font-normal mobile-down:pb-2.5 mobile-down:text-[32px]">{t("title")}</h2>
      <div className="flex flex-wrap gap-7">
        <LetterPaper kind="story" />
        <LetterPaper kind="friend" />
      </div>
    </section>
  );
}

function LetterPaper({ kind }: { kind: "story" | "friend" }) {
  const story = kind === "story";
  const color = story ? "text-brick" : "text-airblue";
  const t = useTranslations(`landing.twoLetters.${kind}`);
  const steps = t.raw("steps") as { desktop: string; mobile: string }[];
  return (
    <div className={`ruled relative flex-1 basis-[440px] border border-rule bg-paper px-8 py-9 mobile-down:basis-auto mobile-down:px-5 mobile-down:shadow-[0_6px_0_-3px_#E3DACB] ${story ? "-rotate-[0.5deg]" : "rotate-[0.6deg] mobile-down:rotate-[0.5deg]"}`}>
      <span className={`stampbox absolute left-6 top-[-16px] bg-paper mobile-down:left-4 mobile-down:text-[22px] ${color}`}>{t("stamp")}</span>
      <h3 className="m-0 font-pen text-[30px] font-normal leading-9 mobile-down:text-[26px]">{t("title")}</h3>
      <p className="m-0 font-pen text-[22px] leading-9 text-ink-2 mobile-down:hidden">{t("sub")}</p>
      <ol className="m-0 flex list-none flex-col p-0">
        {steps.map(({ desktop, mobile }, i) => (
          <li key={desktop} className="flex gap-3.5 font-pen text-[22px] leading-9 mobile-down:gap-3 mobile-down:text-xl">
            <span className={`w-[22px] shrink-0 font-anton ${color} mobile-down:w-[18px]`}>{i + 1}</span>
            <span className="mobile-down:hidden">
              <Marked text={desktop} />
            </span>
            <span className="hidden mobile-down:inline">
              <Marked text={mobile} />
            </span>
          </li>
        ))}
      </ol>
      <AuthLink href={story ? "/write?kind=story" : "/write"} className={`btn my-3.5 min-h-11 px-5 text-[22px] mobile-down:hidden ${story ? "btn-brick" : "btn-blue"}`}>
        {t("cta")}
      </AuthLink>
    </div>
  );
}

const TILTS = ["-rotate-[0.6deg]", "rotate-[0.7deg]", "rotate-[0.4deg]", "-rotate-[0.8deg]"];
function preview(s: Story) {
  return (s.content ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

function WaitingStories({ stories }: { stories: Story[] }) {
  const t = useTranslations("landing.waiting");
  if (stories.length === 0) return null;
  // 데스크톱: 날짜별 묶음 + 2열. 모바일: 날짜 열 숨기고 카드 2장만
  const groups: { key: string; dd: string; mon: string; wd: string; items: Story[] }[] = [];
  stories.forEach((s) => {
    const p = seoulParts(s.createdAt);
    const g = groups.find((x) => x.key === p.key);
    if (g) g.items.push(s);
    else groups.push({ ...p, items: [s] });
  });
  let idx = 0;
  return (
    <section className={`${WRAP} flex flex-col gap-7 pb-[88px] mobile-down:gap-5 mobile-down:pb-14`}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3 mobile-down:items-baseline mobile-down:border-0 mobile-down:pb-0">
        <h2 className="m-0 font-pen text-[40px] font-normal mobile-down:text-[32px]">{t("title")}</h2>
        <Link href="/stories" className="inline-flex min-h-11 items-center border-b-2 border-airblue font-pen text-xl text-airblue mobile-down:border-b mobile-down:text-lg">
          <span className="mobile-down:hidden">{t("viewAll")}</span>
          <span className="hidden mobile-down:inline">{t("viewAllShort")}</span>
        </Link>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="flex flex-wrap gap-6 mobile-down:contents">
          <div className="flex basis-[120px] flex-col items-start gap-0.5 font-anton text-ink mobile-down:hidden">
            <span className="text-[48px] leading-none">{g.dd}</span>
            <span className="text-sm tracking-[0.1em] text-ink-3">
              {g.mon} · {g.wd}
            </span>
          </div>
          <div className="grid flex-1 basis-[560px] grid-cols-2 gap-5 mobile-down:contents">
            {g.items.map((s) => {
              const i = idx++;
              return <StoryCard key={s._id} story={s} tilt={TILTS[i % TILTS.length]} hiddenOnMobile={i >= 2} />;
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function StoryCard({ story, tilt, hiddenOnMobile }: { story: Story; tilt: string; hiddenOnMobile: boolean }) {
  const t = useTranslations("landing.waiting");
  const n = story.replyCount ?? 0;
  const p = seoulParts(story.createdAt);
  return (
    <Link href={`/letter/${story._id}`} className={`ruled relative flex flex-col border border-rule bg-paper px-[26px] py-9 text-ink mobile-down:overflow-hidden mobile-down:bg-none mobile-down:px-6 mobile-down:pb-6 mobile-down:pt-7 ${tilt} ${hiddenOnMobile ? "mobile-down:hidden" : ""}`}>
      <div className="airmail absolute left-0 right-0 top-0 hidden h-1.5 mobile-down:block" aria-hidden="true" />
      <span className={`badge absolute right-4 top-3.5 mobile-down:top-5 ${n > 0 ? "bg-airblue" : "bg-brick"}`}>{n > 0 ? t("replies", { count: n }) : t("waiting")}</span>
      <span className="hidden font-pen text-lg leading-none text-brick mobile-down:block">{t("storyLabel")}</span>
      <span className="font-pen text-lg leading-9 text-brick mobile-down:mt-2">To. {story.recipientName || t("defaultRecipient")}</span>
      <strong className="line-clamp-1 font-pen text-[26px] font-normal leading-9">{story.title || preview(story)}</strong>
      <span className="line-clamp-1 text-base leading-9 text-ink-2 mobile-down:hidden">{preview(story)}</span>
      <span className="mt-2 hidden font-anton text-xs tracking-[0.1em] text-ink-3 mobile-down:block">
        {p.mm}.{p.dd} · {p.wd}
      </span>
    </Link>
  );
}

function LinkLetter() {
  const t = useTranslations("landing.linkLetter");
  return (
    <section className={`${WRAP} flex flex-wrap items-center gap-12 pb-24 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-[18px] mobile-down:pb-14`}>
      <div className="flex flex-1 basis-[420px] flex-col gap-[18px] mobile-down:contents">
        <span className="stampbox self-start text-airblue mobile-down:order-1 mobile-down:text-[22px]">{t("stamp")}</span>
        <h2 className="m-0 font-pen text-[44px] font-normal leading-[1.3] mobile-down:order-2 mobile-down:text-[34px]">
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
        <p className="m-0 max-w-[30em] text-base leading-[1.9] text-ink-2 mobile-down:order-3 mobile-down:max-w-none mobile-down:text-[15px]">
          {t("body")}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 mobile-down:order-5 mobile-down:mt-0">
          <AuthLink href="/write" className="btn btn-blue-fill min-h-[50px] px-[26px] text-2xl mobile-down:min-h-[52px] mobile-down:w-full">
            {t("cta")}
          </AuthLink>
        </div>
      </div>
      {/* 메신저 말풍선 목업 */}
      <div className="flex flex-1 basis-[400px] justify-center mobile-down:order-4 mobile-down:basis-auto">
        <div className="flex w-full max-w-[360px] flex-col gap-3 rounded-xl bg-[#E9E2D6] px-4 py-5 mobile-down:max-w-none mobile-down:gap-2.5 mobile-down:px-3.5 mobile-down:py-4">
          <div className="max-w-[85%] self-end rounded-[10px_2px_10px_10px] border border-rule bg-paper px-3.5 py-3 text-sm leading-[1.6] mobile-down:px-3 mobile-down:py-2.5">{t("chat.message")}</div>
          <div className="flex max-w-[85%] flex-col self-end overflow-hidden rounded-[10px_2px_10px_10px] border border-rule bg-paper mobile-down:w-[85%]">
            <div className="relative flex h-[120px] items-center justify-center border-b border-rule bg-cream mobile-down:h-24">
              <Image src="/v8/envelope-small.png" alt="" width={56} height={50} className="h-[50px] w-14 object-contain mobile-down:h-[42px] mobile-down:w-12" />
              <div className="airmail absolute left-0 right-0 top-0 h-1.5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 px-3.5 py-3 mobile-down:px-3 mobile-down:py-2.5">
              <strong className="font-pen text-xl font-normal leading-[1.3]">{t("chat.title")}</strong>
              <span className="text-[13px] leading-[1.6] text-ink-2">
                <span className="mobile-down:hidden">{t("chat.previewLong")}</span>
                <span className="hidden mobile-down:inline">{t("chat.previewShort")}</span>
              </span>
              <span className="mt-1 text-[11px] text-ink-3 mobile-down:mt-0 mobile-down:text-xs">{t("chat.footer")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhysicalLetter() {
  const t = useTranslations("landing.physical");
  return (
    <section className={`${WRAP} pb-24 mobile-down:pb-14`}>
      <div className="relative flex flex-wrap items-center gap-8 border border-rule bg-paper px-12 py-10 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-3.5 mobile-down:px-5 mobile-down:pb-8 mobile-down:pt-9">
        <div className="airmail absolute left-0 right-0 top-0 h-2" aria-hidden="true" />
        <div className="airmail absolute bottom-0 left-0 right-0 h-2" aria-hidden="true" />
        <div className="flex flex-1 basis-[400px] flex-col gap-3.5 mobile-down:contents">
          <h2 className="m-0 font-pen text-[40px] font-normal leading-[1.3] mobile-down:order-1 mobile-down:mt-1 mobile-down:text-[32px]">
            {t("title1")}
            <br />
            {t("title2")}
          </h2>
          <p className="m-0 max-w-[30em] text-base leading-[1.8] text-ink-2 mobile-down:order-3 mobile-down:max-w-none mobile-down:text-[15px]">{t("body")}</p>
          <Link href="/stories" className="btn btn-ink mt-1.5 min-h-12 self-start px-6 text-[22px] mobile-down:order-4 mobile-down:mt-0 mobile-down:self-stretch">
            {t("cta")}
          </Link>
        </div>
        <div className="flex flex-1 basis-[380px] justify-center mobile-down:order-2 mobile-down:basis-auto">
          <Image src="/v8/hand-envelope.png" alt={t("imageAlt")} width={1100} height={790} className="h-auto w-full max-w-[480px] object-contain mobile-down:max-w-none" />
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const t = useTranslations("landing.contact");
  return (
    <section className={`${WRAP} flex flex-col items-center gap-4 pb-20 text-center mobile-down:gap-3.5 mobile-down:pb-14`}>
      <Image src="/v8/contact.svg" alt="" width={72} height={72} className="h-[72px] w-[72px] object-contain mobile-down:h-[60px] mobile-down:w-[60px]" />
      <h2 className="m-0 font-pen text-[34px] font-normal mobile-down:text-[28px]">{t("title")}</h2>
      <a href="mailto:letter-community@naver.com" className="btn btn-ink min-h-11 px-5 text-xl">
        {t("cta")}
      </a>
    </section>
  );
}
