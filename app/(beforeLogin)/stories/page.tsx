import type { Metadata } from "next";
import AuthLink from "@/components/shareds/AuthLink";
import { EmptyState, StoriesFilter, StoryList } from "@/components/stories";
import { getStories, type GetStoriesParams, type SortOption, type StoriesResponse } from "@/lib/api";

export const metadata: Metadata = { title: "답장을 기다리는 사연 | Letter" };
// 쿼리로 필터하는 공개 목록. 빌드 시 프리렌더하지 않는다
export const dynamic = "force-dynamic";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";
const LIMIT = 12;

type Search = Promise<{ search?: string; sort?: string; category?: string }>;

export default async function StoriesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const params: GetStoriesParams = {
    limit: LIMIT,
    search: sp.search?.trim() || undefined,
    sort: (sp.sort === "popular" ? "popular" : "latest") as SortOption,
    category: sp.category || undefined,
  };

  let res: StoriesResponse | null = null;
  try {
    res = await getStories({ ...params, page: 1 });
  } catch (error) {
    console.error("사연 목록 로드 실패:", error);
  }
  const stories = res?.data ?? [];
  const listKey = `${params.search ?? ""}|${params.sort}|${params.category ?? ""}`;

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-10 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">모르는 누군가의 이야기</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">답장을 기다리는 사연</h1>
        </div>
        <AuthLink href="/write?kind=story" className="btn btn-brick min-h-[52px] text-[26px] mobile-down:hidden">
          나도 사연 남기기
        </AuthLink>
      </section>

      <StoriesFilter />

      <section className={`${WRAP} flex flex-col gap-3 pb-16 pt-10 mobile-down:pb-10 mobile-down:pt-6`}>
        {res === null ? (
          <p role="alert" className="m-0 py-24 text-center font-pen text-2xl text-brick">
            사연을 불러오지 못했어요.
          </p>
        ) : stories.length === 0 ? (
          <EmptyState filtered={Boolean(params.search || params.category || params.sort !== "latest")} />
        ) : (
          <StoryList key={listKey} initial={stories} pagination={res.pagination} params={params} />
        )}
      </section>

      <AuthLink href="/write?kind=story" className="btn btn-brick sticky bottom-4 mx-4 mb-6 hidden min-h-14 self-end text-2xl shadow-[0_8px_0_-3px_#E3DACB] mobile-down:inline-flex">
        + 사연 남기기
      </AuthLink>
    </main>
  );
}
