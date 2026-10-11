"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getDrafts, deleteDraft } from "@/lib/draft-api";
import type { DraftLetter } from "@/types/draft";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

/** 임시저장 목록. 우편함 보드 작업 때 그쪽으로 옮길 수 있음 */
export default function DraftsPage() {
  const { data: session } = useSession();
  const token = session?.backendToken;
  const [drafts, setDrafts] = useState<DraftLetter[] | null>(null);
  const [removing, setRemoving] = useState<DraftLetter | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getDrafts(token, { limit: 50 })
      .then((res) => setDrafts(res.data.drafts))
      .catch((e) => {
        console.error("임시저장 목록 실패:", e);
        setError("임시저장 목록을 불러오지 못했어요.");
        setDrafts([]);
      });
  }, [token]);

  // 성공하면 목록에서 행이 사라지는 것으로 충분하다. 실패만 한 줄로 알린다
  const remove = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await deleteDraft(token, id);
      setDrafts((list) => list?.filter((d) => d._id !== id) ?? null);
    } catch (e) {
      console.error("임시저장 삭제 실패:", e);
      setError("삭제하지 못했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <main>
      <section className={`${WRAP} flex flex-col gap-3 pb-10 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">쓰다 만 편지</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">임시저장</h1>
      </section>
      <section className={`${WRAP} pb-24`}>
        {error && (
          <p role="alert" className="m-0 mb-4 text-[15px] text-brick">
            {error}
          </p>
        )}
        {drafts === null ? (
          <p className="m-0 font-pen text-xl text-ink-3">불러오는 중...</p>
        ) : drafts.length === 0 ? (
          <p className="m-0 font-pen text-2xl text-ink-2">임시저장한 편지가 없어요.</p>
        ) : (
          <ul className="m-0 list-none border-t-2 border-ink p-0">
            {drafts.map((d) => (
              <li key={d._id} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-rule py-4">
                <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-1">
                  <span className="truncate font-pen text-2xl text-ink">{d.title || d.autoTitle || "제목 없음"}</span>
                  <span className="text-sm text-ink-2">
                    {d.type === "story" ? "사연 편지" : "마음 편지"}
                    {d.recipientName ? ` · To. ${d.recipientName}` : ""}
                    {` · ${fmt(d.lastSavedAt)}`}
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <Link href={`/write?draftId=${d._id}`} className="btn btn-blue min-h-11 px-5 text-xl">
                    이어 쓰기
                  </Link>
                  <button type="button" onClick={() => setRemoving(d)} className="btn btn-ink min-h-11 px-5 text-xl">
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="이 임시저장을 지울까요"
        description={removing ? `‘${removing.title || removing.autoTitle || "제목 없음"}’이 지워져요.` : ""}
        confirmText="삭제"
        variant="destructive"
        onConfirm={() => removing && remove(removing._id)}
      />
    </main>
  );
}
