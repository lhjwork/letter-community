"use client";

import { useState } from "react";
import { getStories, type GetStoriesParams, type Pagination, type Story } from "@/lib/api";
import StoryBrick from "./StoryBrick";

type Props = { initial: Story[]; pagination: Pagination; params: GetStoriesParams };

/** 벽돌식 목록 + "더 보기"(다음 페이지 이어 붙이기). 필터가 바뀌면 부모가 key 로 새로 마운트한다 */
export default function StoryList({ initial, pagination, params }: Props) {
  const [stories, setStories] = useState(initial);
  const [page, setPage] = useState(pagination.page);
  const [hasNext, setHasNext] = useState(pagination.hasNextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const res = await getStories({ ...params, page: page + 1 });
      setStories((prev) => [...prev, ...res.data]);
      setPage(res.pagination.page);
      setHasNext(res.pagination.hasNextPage);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="[column-gap:28px] [columns:3_300px] mobile-down:columns-1">
        {stories.map((s, i) => (
          <StoryBrick key={s._id} story={s} index={i} />
        ))}
      </div>
      {hasNext && (
        <div className="flex flex-col items-center gap-3 pt-3 mobile-down:-mt-7 mobile-down:pt-0">
          <button type="button" className="btn btn-ink" onClick={loadMore} disabled={loading} aria-busy={loading}>
            {loading ? (
              "불러오는 중"
            ) : (
              <>
                <span className="mobile-down:hidden">사연 더 보기</span>
                <span className="hidden mobile-down:inline">더 보기</span>
              </>
            )}
          </button>
          {error && (
            <p role="alert" className="m-0 text-base text-brick">
              불러오지 못했어요. 다시 눌러 주세요.
            </p>
          )}
        </div>
      )}
    </>
  );
}
