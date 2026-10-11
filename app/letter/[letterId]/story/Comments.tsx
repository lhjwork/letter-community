"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { COMMENT_MAX, createComment, deleteComment, getComments, type StoryComment } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { showAlert } from "@/components/ui/AppAlert";
import LoginDialog from "@/components/shareds/LoginDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Props = { letterId: string; initial: { items: StoryComment[]; total: number; hasNextPage: boolean } };

/** 댓글: 한 줄 반응. 종이·테이프·배지·좋아요 없음, 1px 선 구분, 36px 리듬, 5개씩 더 보기 */
export default function Comments({ letterId, initial }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.backendToken;
  const [items, setItems] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [hasNext, setHasNext] = useState(initial.hasNextPage);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "authenticated" || !token) return setLogin(true);
    const content = text.trim();
    if (!content) return showAlert("댓글을 적어 주세요.");
    setBusy(true);
    try {
      const { data } = await createComment(letterId, content, token);
      // 오래된 순 목록의 끝에 붙인다(아직 안 불러온 페이지가 있으면 그 뒤에 보여야 하지만, 내 댓글은 바로 보이게 둔다)
      setItems((prev) => [...prev, { _id: data._id, nickname: session.user?.name ?? "나", content, createdAt: data.createdAt, isMine: true }]);
      setTotal((n) => n + 1);
      setText("");
      router.refresh(); // 사연 종이의 "댓글 N" 동기화
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "댓글을 남기지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await deleteComment(letterId, id, token);
      setItems((prev) => prev.filter((c) => c._id !== id));
      setTotal((n) => Math.max(0, n - 1));
      router.refresh();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "댓글을 삭제하지 못했어요.");
    }
  };

  const more = async () => {
    setBusy(true);
    try {
      const { data } = await getComments(letterId, page + 1, token);
      setItems((prev) => {
        const seen = new Set(prev.map((c) => c._id));
        return [...prev, ...data.items.filter((c) => !seen.has(c._id))].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
      setPage((p) => p + 1);
      setHasNext(data.hasNextPage);
      setTotal(data.total);
    } catch {
      showAlert("댓글을 더 불러오지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2 id="cmt-h" className="m-0 border-b-2 border-ink pb-3 font-pen text-[40px] font-normal leading-9 mobile-down:pb-2.5 mobile-down:text-[30px]">
        댓글 {total}
      </h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="comment-body" className="sr-only">
          댓글 내용
        </label>
        <textarea
          id="comment-body"
          name="content"
          rows={2}
          maxLength={COMMENT_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="한 줄이면 충분해요."
          className="field min-h-[72px] resize-none px-3.5 py-[18px] text-base leading-9 placeholder:text-ink-3"
        />
        <div className="flex min-h-[60px] items-center justify-end gap-3.5 mobile-down:min-h-11 mobile-down:justify-between mobile-down:gap-3">
          <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3" aria-live="polite">
            {text.length} / {COMMENT_MAX}
          </span>
          <button type="submit" disabled={busy} className="btn btn-ink min-h-11 px-[18px] text-xl">
            댓글 남기기
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <ul className="m-0 list-none border-t border-rule p-0">
          {items.map((c) => {
            const p = seoulParts(c.createdAt);
            return (
              <li key={c._id} className="grid grid-cols-[160px_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-rule py-[18px] mobile-down:grid-cols-[minmax(0,1fr)_auto]">
                <span className="truncate font-pen text-xl leading-9 text-ink">{c.nickname}</span>
                <p className="m-0 min-w-0 break-words text-base leading-9 text-ink mobile-down:col-span-2 mobile-down:row-start-2">{c.content}</p>
                <span className="flex items-center gap-3 whitespace-nowrap mobile-down:col-start-2 mobile-down:row-start-1">
                  <time dateTime={c.createdAt} className="font-anton text-xs leading-9 tracking-[0.1em] text-ink-3">
                    {p.mm}.{p.dd} · {p.wd}
                  </time>
                  {c.isMine && (
                    <button type="button" onClick={() => setPendingDelete(c._id)} className="inline-flex min-h-11 min-w-11 items-center justify-center bg-transparent font-pen text-lg text-ink-3 hover:text-brick" aria-label="내 댓글 삭제">
                      삭제
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {hasNext && (
        <button type="button" onClick={more} disabled={busy} aria-busy={busy} className="btn btn-ink min-h-11 self-center px-5 text-xl">
          {busy ? "불러오는 중" : "댓글 더 보기"}
        </button>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 되돌릴 수 없어요."
        confirmText="삭제"
        variant="destructive"
        onConfirm={() => pendingDelete && remove(pendingDelete)}
      />
      <LoginDialog isOpen={login} onClose={() => setLogin(false)} callbackUrl={`/letter/${letterId}#comments`} />
    </>
  );
}
