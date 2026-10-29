import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuthLink from "@/components/shareds/AuthLink";
import { GUIDES, getGuide } from "@/lib/guides";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  const url = `/guide/${g.slug}`;
  // 한국어 글만 있으니 레이아웃의 en·ja hreflang 을 덮어쓴다
  return {
    title: `${g.title} | Letter`,
    description: g.description,
    alternates: { canonical: url, languages: { ko: url } },
    openGraph: { title: g.title, description: g.description, type: "article", url },
  };
}

const WRAP = "mx-auto w-full max-w-[760px] px-6 mobile-down:px-4";

export default async function GuidePage({ params }: { params: Params }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, datePublished: g.date, inLanguage: "ko" };

  return (
    <main lang="ko" className={`${WRAP} flex flex-col gap-10 pb-20 pt-8 mobile-down:gap-8 mobile-down:pb-14 mobile-down:pt-4`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="flex flex-col gap-4 border-b-[1.5px] border-ink pb-8">
        <p className="m-0 font-pen text-[22px] text-ink-3">편지 쓰는 법</p>
        <h1 className="m-0 font-pen text-[44px] font-normal leading-[1.25] mobile-down:text-[34px]">{g.title}</h1>
        <p className="m-0 text-[17px] leading-[1.9] text-ink-2">{g.intro}</p>
      </header>

      {g.sections.map((s) => (
        <section key={s.h} className="flex flex-col gap-4">
          <h2 className="m-0 font-pen text-[32px] font-normal leading-[1.3] mobile-down:text-[28px]">{s.h}</h2>
          {s.p?.map((t) => (
            <p key={t} className="m-0 text-[17px] leading-[1.9] text-ink-2">
              {t}
            </p>
          ))}
          {s.examples && (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {s.examples.map((t) => (
                <li key={t} className="border-l-[3px] border-brick bg-paper px-5 py-4 font-pen text-[24px] leading-[1.5] text-ink">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <aside className="flex flex-col items-start gap-4 border-[1.5px] border-ink bg-paper p-8 mobile-down:p-6">
        <p className="m-0 font-pen text-[30px] leading-[1.3]">이 편지, 종이로 보내 보세요</p>
        <p className="m-0 text-[17px] leading-[1.9] text-ink-2">
          레터에서 편지를 쓰면 링크가 생겨요. 링크를 받은 사람에게는 봉투처럼 제목과 첫 줄이 먼저 보이고, 원하면 종이 편지로 신청할 수 있어요. 레터가 종이에 옮겨 적어 우편으로 보내드려요.
        </p>
        <AuthLink href="/write" className="btn btn-brick min-h-[52px] px-7 text-[26px]">
          편지 쓰러 가기
        </AuthLink>
      </aside>
    </main>
  );
}
