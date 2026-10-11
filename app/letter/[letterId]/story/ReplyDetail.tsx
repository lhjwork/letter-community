import Link from "next/link";
import { seoulParts } from "@/lib/seoulDate";
import { LetterBody } from "./StoryDetail";
import { CopyLinkButton } from "./StoryActions";

export type ReplyLetter = {
  _id: string;
  content: string;
  contentType?: "text" | "html";
  senderName?: string;
  recipientName?: string;
  createdAt: string;
  replyTo: { _id: string; title: string };
  isAdminReply?: boolean;
  isAdopted?: boolean;
};

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** 사연에 달린 답장 한 통을 끝까지 읽는 화면. 사연 종이와 같은 괘선 36px 리듬, 실물 신청 없음 */
export default function ReplyDetail({ reply }: { reply: ReplyLetter }) {
  const p = seoulParts(reply.createdAt);
  const storyHref = `/letter/${reply.replyTo._id}`;
  const stamp = reply.isAdminReply ? ["레터의 답장", "text-brick"] : reply.isAdopted ? ["채택된 답장", "text-approve"] : ["답장", "text-airblue"];
  const from = reply.isAdminReply ? "레터" : reply.senderName || "익명";
  return (
    <main className="flex flex-col">
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-3 mobile-down:pt-1`}>
        <Link href={storyHref} className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          ← 사연으로 돌아가기
        </Link>
      </section>

      <section className={`${WRAP} flex flex-col items-center pb-24 pt-3 mobile-down:pb-12`}>
        {reply.replyTo.title && (
          <p className="m-0 mb-8 text-center font-pen text-2xl text-ink-3 mobile-down:mb-6 mobile-down:text-xl">
            ‘{reply.replyTo.title}’에 온 답장
          </p>
        )}
        <article className="paper ruled flex w-full max-w-[760px] -rotate-[0.4deg] flex-col px-14 py-[72px] mobile-down:px-5 mobile-down:py-9">
          <span className={`stampbox absolute -top-4 left-7 bg-paper mobile-down:left-4 mobile-down:text-[22px] ${stamp[1]}`}>{stamp[0]}</span>
          <span aria-hidden="true" className="post absolute right-8 top-7 h-[72px] w-[72px] rotate-[12deg] text-[11px] mobile-down:right-4 mobile-down:top-4 mobile-down:h-[60px] mobile-down:w-[60px] mobile-down:text-[9px]">
            SEOUL<span className="text-[15px] mobile-down:text-[13px]">{String(new Date(reply.createdAt).getFullYear()).slice(-2)}</span>
            {p.mm}.{p.dd}
          </span>
          <p className="m-0 font-pen text-[28px] leading-9 text-brick mobile-down:text-2xl">To. {reply.recipientName || "사연을 보낸 분께"}</p>
          <LetterBody content={reply.content} contentType={reply.contentType} />
          <p className="m-0 mt-9 self-end font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-2xl">From. {from}</p>
          <p className="m-0 mt-9 h-9 font-anton text-xs leading-9 tracking-[0.1em] text-ink-3 mobile-down:text-[11px]">
            {p.mm}.{p.dd} · {p.wd}
          </p>
        </article>

        <div className="mt-10 flex w-full max-w-[760px] flex-wrap justify-center gap-3 mobile-down:mt-8">
          <Link href={storyHref} className="btn btn-ink mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl">
            사연 다시 읽기
          </Link>
          <CopyLinkButton />
        </div>
      </section>
    </main>
  );
}
