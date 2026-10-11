"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { track } from "@/lib/analytics/ga";
import { createLetter } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";
import LoginDialog from "@/components/shareds/LoginDialog";

export const REPLY_MAX = 1000;

type Props = { storyId: string; storyTitle?: string; to: string };

/** 답장 쓰기(#reply). 답장 = 기존 답장 생성 경로(createLetter + replyToId, type friend, contentType text) */
export default function ReplyForm({ storyId, storyTitle, to }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [login, setLogin] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "authenticated" || !session?.backendToken) return setLogin(true);
    const body = content.trim();
    if (!body) return showAlert("답장 내용을 적어 주세요.", { tone: "error" });
    if (body.length > REPLY_MAX) return showAlert(`답장은 ${REPLY_MAX}자 이내여야 해요.`, { tone: "error" });
    const title = `Re: ${storyTitle || "사연"}`.slice(0, 100);
    setSubmitting(true);
    try {
      await createLetter(
        { title, content: body, contentType: "text", type: "friend", replyToId: storyId, isAnonymous: anonymous, recipientName: to, ogTitle: title, ogPreviewText: body.slice(0, 60) + (body.length > 60 ? "..." : "") },
        session.backendToken,
      );
      track("letter_create", { letter_type: "friend", is_reply: true, is_public: false, content_length: body.length });
      setContent("");
      showAlert("답장을 보냈어요.", { tone: "success" });
      router.refresh();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "답장을 보내지 못했어요. 다시 시도해 주세요.", { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="paper ruled mx-auto flex w-full max-w-[860px] rotate-[0.3deg] flex-col px-12 py-[72px] mobile-down:px-5 mobile-down:py-9">
      <span className="stampbox absolute -top-4 left-7 bg-paper text-airblue mobile-down:left-4 mobile-down:text-[22px]">답장 쓰기</span>
      <p className="m-0 font-pen text-[26px] leading-9 text-brick mobile-down:text-2xl">To. {to}</p>
      <label htmlFor="reply-body" className="sr-only">
        답장 내용
      </label>
      <textarea
        id="reply-body"
        name="content"
        rows={6}
        value={content}
        maxLength={REPLY_MAX}
        onChange={(e) => setContent(e.target.value)}
        placeholder="천천히 써도 괜찮아요. 당신의 말이 누군가에겐 처음 듣는 말일 수 있어요."
        className="mt-9 min-h-[216px] w-full resize-y border-0 bg-transparent p-0 text-[19px] leading-9 text-ink outline-none [--mobile-fs:19px] placeholder:text-ink-3 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
      <div className="mt-9 flex min-h-[72px] flex-wrap items-center justify-between gap-3 mobile-down:min-h-0 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-0">
        <label className="flex min-h-11 items-center gap-2.5 text-[15px] text-ink-2 mobile-down:h-9 mobile-down:min-h-0">
          <input type="checkbox" name="anonymous" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-[18px] w-[18px] accent-ink" />
          익명으로 보내요
        </label>
        <span className="flex items-center gap-2.5 mobile-down:my-2 mobile-down:flex-col mobile-down:items-stretch">
          <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3 mobile-down:hidden" aria-live="polite">
            {content.length} / {REPLY_MAX}
          </span>
          <button type="submit" disabled={submitting} aria-busy={submitting} className="btn btn-brick min-h-[52px] text-[26px] mobile-down:min-h-14">
            {submitting ? "보내는 중" : "답장 보내기"}
          </button>
        </span>
      </div>
      <p className="m-0 text-base leading-9 text-ink-3">
        레터가 고른 답장이 사연자에게 전해져요.<span className="mobile-down:hidden"> 다른 답장도 이 자리에 남아요.</span>
      </p>
      <LoginDialog isOpen={login} onClose={() => setLogin(false)} callbackUrl={`/letter/${storyId}#reply`} />
    </form>
  );
}
