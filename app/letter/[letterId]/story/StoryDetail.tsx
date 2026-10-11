import Link from "next/link";
import JumpLink from "@/components/ui/JumpLink";
import type { StoryComment, StoryReply } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import Comments from "./Comments";
import ReplyCard from "./ReplyCard";
import ReplyForm from "./ReplyForm";
import { ReplyCta, SaveButton, CopyLinkButton } from "./StoryActions";

export type StoryForDetail = {
  _id: string;
  title?: string;
  content: string;
  contentType?: "text" | "html";
  senderName?: string;
  recipientName?: string;
  category?: string;
  createdAt: string;
  commentCount?: number;
};

type Props = {
  story: StoryForDetail;
  replies: StoryReply[];
  comments: { items: StoryComment[]; total: number; hasNextPage: boolean };
};

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** v8-StoryDetail / M-StoryDetail. 괘선 36px 위에 모든 줄이 앉는다 */
export default function StoryDetail({ story, replies, comments }: Props) {
  const p = seoulParts(story.createdAt);
  const to = story.recipientName || "누군가에게";
  const commentCount = comments.total ?? story.commentCount ?? 0;

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-3 mobile-down:pt-1`}>
        <Link href="/stories" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          ← 사연 목록
        </Link>
      </section>

      <section className={`${WRAP} flex flex-wrap items-start gap-10 pb-12 pt-3 mobile-down:gap-0 mobile-down:pb-8 mobile-down:pt-4`}>
        <article className="paper ruled flex min-w-0 flex-[1_1_560px] -rotate-[0.4deg] flex-col px-14 py-[72px] mobile-down:flex-[1_1_100%] mobile-down:px-5 mobile-down:py-9">
          <span className="stampbox absolute -top-4 left-7 bg-paper text-brick mobile-down:left-4 mobile-down:text-[22px]">사연 편지</span>
          <span aria-hidden="true" className="post absolute right-8 top-7 h-[72px] w-[72px] rotate-[12deg] text-[11px] mobile-down:right-4 mobile-down:top-4 mobile-down:h-[60px] mobile-down:w-[60px] mobile-down:text-[9px]">
            SEOUL<span className="text-[15px] mobile-down:text-[13px]">26</span>
            {p.mm}.{p.dd}
          </span>
          <p className="m-0 font-pen text-[28px] leading-9 text-brick mobile-down:text-2xl">To. {to}</p>
          {story.title && <h1 className="relative -top-0.5 m-0 font-pen text-[34px] font-normal leading-9 mobile-down:text-[32px]">{story.title}</h1>}
          <LetterBody content={story.content} contentType={story.contentType} />
          <p className="m-0 mt-9 self-end font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-2xl">From. {story.senderName || "익명"}</p>
          <div className="mt-9 flex h-9 flex-wrap items-center justify-between gap-2">
            <span className="chip min-h-7 px-2.5 text-base mobile-down:text-[15px]">{story.category || "기타"}</span>
            <span className="inline-flex items-center gap-2.5">
              <span className="font-anton text-xs tracking-[0.1em] text-ink-3 mobile-down:text-[11px]">
                {p.mm}.{p.dd} · {p.wd} · 답장 {replies.length}
              </span>
              <JumpLink to="comments" className="inline-flex min-h-11 items-center font-anton text-xs tracking-[0.1em] text-ink-3 hover:text-brick mobile-down:text-[11px]">
                <span className="border-b-[1.5px] border-current">댓글 {commentCount}</span>
              </JumpLink>
            </span>
          </div>
        </article>

        <aside className="flex min-w-0 flex-[0_1_320px] flex-col gap-5 mobile-down:mt-8 mobile-down:flex-[1_1_100%] mobile-down:flex-row mobile-down:gap-2.5">
          <ReplyCta storyId={story._id} className="btn btn-brick min-h-14 text-[28px] mobile-down:hidden" />
          <SaveButton letterId={story._id} />
          <CopyLinkButton />
        </aside>
      </section>

      <section className={`${WRAP} flex flex-col gap-7 pb-16 mobile-down:pb-10`}>
        <h2 className="m-0 border-b-2 border-ink pb-3 font-pen text-[40px] font-normal leading-9 mobile-down:pb-2.5 mobile-down:text-[30px]">답장 {replies.length}통</h2>
        {replies.length === 0 ? (
          <p className="m-0 py-9 text-center font-pen text-2xl text-ink-2">아직 답장이 없어요. 첫 답장을 써 주세요.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(520px,100%),1fr))] items-start gap-7">
            {replies.map((r, i) => (
              <ReplyCard key={r._id} reply={r} index={i} />
            ))}
          </div>
        )}
      </section>

      <section id="reply" className={`${WRAP} scroll-mt-6 pb-[72px] mobile-down:pb-10`}>
        <ReplyForm storyId={story._id} storyTitle={story.title} to={to} />
      </section>

      <section id="comments" aria-labelledby="cmt-h" className="mx-auto flex w-full max-w-[908px] scroll-mt-6 flex-col gap-9 px-6 pb-24 mobile-down:gap-7 mobile-down:px-4 mobile-down:pb-10">
        <Comments letterId={story._id} initial={comments} />
      </section>

      <div className="sticky bottom-0 hidden border-t border-rule bg-cream/95 px-4 pb-5 pt-3 mobile-down:block">
        <ReplyCta storyId={story._id} className="btn btn-brick min-h-14 w-full text-[28px]" />
      </div>
    </main>
  );
}

/** textarea 원문은 빈 줄로 단락을 나눠 36px 간격, 예전 HTML(TipTap) 글은 p 를 줄에 앉힌다. 사연·마음 편지 공용 */
export function LetterBody({ content, contentType }: { content: string; contentType?: "text" | "html" }) {
  if (contentType === "text") {
    const paras = content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    return (
      <>
        {paras.map((para, i) => (
          <p key={i} className={`m-0 whitespace-pre-line text-[19px] leading-9 ${i > 0 ? "mt-9" : ""}`}>
            {para}
          </p>
        ))}
      </>
    );
  }
  return <div className="text-[19px] leading-9 [&_p+p]:mt-9 [&_p:empty]:hidden [&_p]:m-0 [&_p]:leading-9" dangerouslySetInnerHTML={{ __html: content }} />;
}
