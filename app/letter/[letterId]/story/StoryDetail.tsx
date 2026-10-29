import Link from "next/link";
import { useTranslations } from "next-intl";
import JumpLink from "@/components/ui/JumpLink";
import LetterPages from "@/components/LetterPages";
import { letterText } from "@/lib/letterText";
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
  /** 서버가 토큰으로 계산한 본인 여부(작성자 ID 는 내려오지 않는다) */
  isAuthor?: boolean;
};

type Props = {
  story: StoryForDetail;
  replies: StoryReply[];
  comments: { items: StoryComment[]; total: number; hasNextPage: boolean };
};

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** v8-StoryDetail / M-StoryDetail. 실물 편지지(LetterPages) 괘선 위에 모든 줄이 앉는다 */
export default function StoryDetail({ story, replies, comments }: Props) {
  const t = useTranslations("letter");
  const p = seoulParts(story.createdAt);
  // 사연은 레터에게 남긴다. 예전 사연은 적힌 받는 사람 그대로
  const to = story.recipientName || t("names.letter");
  const mine = !!story.isAuthor;
  const commentCount = comments.total ?? story.commentCount ?? 0;
  // [배지, 배지 색, 한 줄]. 사연은 레터가 꼭 답장한다
  const status = replies.some((r) => r.isAdminReply)
    ? [t("story.statusAdmin"), "bg-brick", t("story.statusAdminLine")]
    : replies.length > 0
      ? [t("story.statusReplies", { count: replies.length }), "bg-airblue", t("story.statusRepliesLine")]
      : [t("story.statusWaiting"), "bg-ink-3", t("story.statusWaitingLine")];

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-3 mobile-down:pt-1`}>
        <Link href="/stories" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          {t("story.back")}
        </Link>
      </section>

      <section className={`${WRAP} flex flex-wrap items-start justify-center gap-11 pb-16 pt-5 mobile-down:gap-8 mobile-down:pb-8 mobile-down:pt-4`}>
        <div className="flex min-w-0 max-w-[720px] flex-[1_1_600px] flex-col mobile-down:flex-[1_1_100%]">
          <LetterPages
            label={t("story.kind")}
            stamp={<span className="stampbox absolute -top-4 left-7 z-10 bg-paper text-brick mobile-down:left-4 mobile-down:text-[22px]">{t("story.kind")}</span>}
            to={`To. ${to}`}
            title={story.title && <h1 className="m-0 truncate text-[length:inherit] font-normal leading-[inherit]">{story.title}</h1>}
            text={letterText(story.content, story.contentType)}
            from={`From. ${story.senderName || t("names.anonymous")}`}
          />
        </div>

        {/* v9-StoryDetail-A 소인 카드. 데스크톱은 편지지 옆에서 따라온다 */}
        <aside className="sticky top-6 flex min-w-0 flex-[0_0_360px] flex-col mobile-down:static mobile-down:flex-[1_1_100%]">
          <div className="relative flex min-w-0 flex-col gap-5 border border-rule bg-paper px-7 pb-6 pt-8 shadow-[0_10px_0_-4px_#E3DACB,0_20px_0_-8px_#EAE2D3] mobile-down:px-5">
            <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
            <div className="flex items-center gap-4">
              <div className="post h-[84px] w-[84px] shrink-0 -rotate-8 text-xs" aria-hidden="true">
                SEOUL
                <span className="text-[17px]">{p.yyyy.slice(2)}</span>
                {p.mm}.{p.dd}
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3">
                  {p.yyyy}.{p.mm}.{p.dd} · {p.wd}
                </span>
                <span className="chip min-h-[30px] px-3 text-lg">{story.category || t("story.categoryFallback")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-[3px] bg-[#F7F1E6] px-4 py-3.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className={`badge ${status[1]}`}>{status[0]}</span>
                <span className="font-pen text-[22px]">{status[2]}</span>
              </span>
              <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
                {t("story.replyCount", { count: replies.length })} ·{" "}
                <JumpLink to="comments" className="inline-flex min-h-11 items-center hover:text-brick">
                  <span className="border-b-[1.5px] border-current">{t("story.commentCount", { count: commentCount })}</span>
                </JumpLink>
              </span>
            </div>

            {!mine && <ReplyCta storyId={story._id} className="btn btn-brick min-h-14 text-[28px] mobile-down:hidden" />}
            <div className="grid grid-cols-2 gap-2.5">
              <SaveButton letterId={story._id} className="btn btn-ink whitespace-nowrap px-2 text-xl" />
              <CopyLinkButton className="btn btn-blue whitespace-nowrap px-2 text-xl" />
            </div>

            {replies.length > 0 && (
              <div className="flex min-w-0 flex-col border-t-2 border-ink pt-1.5">
                <span className="pb-0.5 pt-1.5 font-pen text-[22px]">{t("story.repliesToThis")}</span>
                {replies.slice(0, 3).map((r) => (
                  <Link key={r._id} href={`/letter/${r._id}`} className="group flex min-w-0 flex-col gap-1 border-b border-[#E6DED0] py-3 last:border-b-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate font-pen text-xl group-hover:text-brick ${r.isAdminReply ? "text-brick" : ""}`}>From. {r.isAdminReply ? t("names.letter") : r.authorName}</span>
                      {(r.isAdminReply || r.isAdopted) && <span className={`badge shrink-0 ${r.isAdminReply ? "bg-brick" : "bg-approve"}`}>{r.isAdminReply ? t("replyCard.adminReply") : t("story.adopted")}</span>}
                    </span>
                    <span className="truncate text-sm leading-[1.6] text-ink-2">{(r.plainContent || r.ogPreviewText || "").trim()}</span>
                  </Link>
                ))}
                {replies.length > 3 && (
                  <JumpLink to="replies" className="inline-flex min-h-11 items-center self-end font-pen text-lg text-ink-2 hover:text-brick">
                    {t("story.viewAllReplies", { count: replies.length })}
                  </JumpLink>
                )}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section id="replies" className={`${WRAP} flex scroll-mt-6 flex-col gap-7 pb-16 mobile-down:pb-10`}>
        <h2 className="m-0 border-b-2 border-ink pb-3 font-pen text-[40px] font-normal leading-9 mobile-down:pb-2.5 mobile-down:text-[30px]">{t("story.receivedReplies", { count: replies.length })}</h2>
        {replies.length === 0 ? (
          <p className="m-0 py-9 text-center font-pen text-2xl text-ink-2">{mine ? t("story.emptyMine") : t("story.emptyOthers")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(520px,100%),1fr))] items-start gap-7">
            {replies.map((r, i) => (
              <ReplyCard key={r._id} reply={r} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* 답장 쓰기는 다른 사람만. 답장의 To. 는 예전 그대로 사연의 받는 사람(없으면 "누군가에게") */}
      {!mine && (
        <section id="reply" className={`${WRAP} scroll-mt-6 pb-[72px] mobile-down:pb-10`}>
          <ReplyForm storyId={story._id} storyTitle={story.title} to={story.recipientName || t("names.someone")} />
        </section>
      )}

      <section id="comments" aria-labelledby="cmt-h" className="mx-auto flex w-full max-w-[908px] scroll-mt-6 flex-col gap-9 px-6 pb-24 mobile-down:gap-7 mobile-down:px-4 mobile-down:pb-10">
        <Comments letterId={story._id} initial={comments} />
      </section>

      {!mine && (
        <div className="sticky bottom-0 hidden border-t border-rule bg-cream/95 px-4 pb-5 pt-3 mobile-down:block">
          <ReplyCta storyId={story._id} className="btn btn-brick min-h-14 w-full text-[28px]" />
        </div>
      )}
    </main>
  );
}
