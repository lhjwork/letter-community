import type { Metadata } from "next";
import AuthLink from "@/components/shareds/AuthLink";
import { EmptyState, StoriesFilter, StoryList } from "@/components/stories";
import { getStories, type GetStoriesParams, type StoriesResponse } from "@/lib/api";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.stories");
  return { title: t("metaTitle") };
}
// 쿼리로 필터하는 공개 목록. 빌드 시 프리렌더하지 않는다
export const dynamic = "force-dynamic";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";
const LIMIT = 12;

type Search = Promise<{ search?: string; category?: string }>;

export default async function StoriesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const t = await getTranslations("landing.stories");
  const params: GetStoriesParams = {
    limit: LIMIT,
    search: sp.search?.trim() || undefined,
    // 최신순 고정(인기순은 소셜 피드 정서라 뺐다). 예전 ?sort=popular 링크도 최신순
    sort: "latest",
    category: sp.category || undefined,
  };

  let res: StoriesResponse | null = null;
  try {
    res = await getStories({ ...params, page: 1 });
  } catch (error) {
    console.error("사연 목록 로드 실패:", error);
  }
  const stories = res?.data ?? [];
  const listKey = `${params.search ?? ""}|${params.category ?? ""}`;

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-10 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{t("eyebrow")}</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{t("title")}</h1>
        </div>
        <AuthLink href="/write?kind=story" className="btn btn-brick min-h-[52px] text-[26px] mobile-down:hidden">
          {t("cta")}
        </AuthLink>
      </section>

      <StoriesFilter />

      <section className={`${WRAP} flex flex-col gap-3 pb-16 pt-10 mobile-down:pb-10 mobile-down:pt-6`}>
        {res === null ? (
          <p role="alert" className="m-0 py-24 text-center font-pen text-2xl text-brick">
            {t("loadError")}
          </p>
        ) : stories.length === 0 ? (
          <EmptyState filtered={Boolean(params.search || params.category)} />
        ) : (
          <StoryList key={listKey} initial={stories} pagination={res.pagination} params={params} />
        )}
      </section>

      <AuthLink href="/write?kind=story" className="btn btn-brick sticky bottom-4 mx-4 mb-6 hidden min-h-14 self-end text-2xl shadow-[0_8px_0_-3px_#E3DACB] mobile-down:inline-flex">
        {t("ctaMobile")}
      </AuthLink>
    </main>
  );
}
