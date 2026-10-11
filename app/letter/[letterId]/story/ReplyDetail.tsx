import Link from "next/link";
import JumpLink from "@/components/ui/JumpLink";
import { RequestSteps } from "@/app/letter-box/parts";
import { seoulParts } from "@/lib/seoulDate";
import RequestForm from "../friend/RequestForm";
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
  /** 보는 사람이 원래 사연을 남긴 본인이고 레터 답장·채택 답장이면 true(서버 판단) */
  canRequestPhysical?: boolean;
  /** 본인이 이미 한 실물 신청(거절 제외) */
  myPhysicalRequest?: { requestId: string; status: string };
};

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** 사연에 달린 답장 한 통을 끝까지 읽는 화면. 사연 종이와 같은 괘선 36px 리듬.
 * 사연자 본인에게만 레터 답장·채택 답장을 실물 편지로 받는 신청(#request). 다른 사람에게는 아무것도 안 보인다 */
export default function ReplyDetail({ reply }: { reply: ReplyLetter }) {
  const p = seoulParts(reply.createdAt);
  const storyHref = `/letter/${reply.replyTo._id}`;
  const stamp = reply.isAdminReply ? ["레터의 답장", "text-brick"] : reply.isAdopted ? ["채택된 답장", "text-approve"] : ["답장", "text-airblue"];
  const from = reply.isAdminReply ? "레터" : reply.senderName || "익명";
  const requested = reply.myPhysicalRequest;
  const canRequest = !!reply.canRequestPhysical && !requested;
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

        {requested && (
          <div className="mt-10 flex w-full max-w-[760px] flex-col items-center gap-3 text-center mobile-down:mt-8">
            <p className="m-0 font-pen text-[28px] leading-9 text-brick mobile-down:text-2xl">실물 편지를 신청했어요.</p>
            <RequestSteps status={requested.status} className="justify-center" />
            <Link href={`/letter/${reply._id}/request/${requested.requestId}`} className="inline-flex min-h-11 items-center font-pen text-xl text-ink-2 hover:text-brick">
              <span className="border-b-[1.5px] border-current">진행 보기</span>
            </Link>
          </div>
        )}

        <div className="mt-10 flex w-full max-w-[760px] flex-wrap justify-center gap-3 mobile-down:mt-8">
          {canRequest && (
            <JumpLink to="request" className="btn btn-brick min-h-14 px-8 text-[28px] mobile-down:basis-full">
              실물 편지로 받기
            </JumpLink>
          )}
          <Link href={storyHref} className="btn btn-ink mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl">
            사연 다시 읽기
          </Link>
          <CopyLinkButton />
        </div>
      </section>

      {canRequest && (
        <section id="request" className={`${WRAP} scroll-mt-6 pb-24 mobile-down:pb-12`}>
          <div className="relative flex flex-wrap items-start gap-10 border border-rule bg-paper p-12 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-3.5 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-9">
            <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
            <div className="airmail absolute inset-x-0 bottom-0 h-2 mobile-down:hidden" aria-hidden="true" />
            <div className="flex flex-[1_1_380px] flex-col gap-3.5 mobile-down:flex-none">
              <h2 className="m-0 font-pen text-[40px] font-normal leading-[1.3] mobile-down:mt-1 mobile-down:text-[32px] mobile-down:leading-[1.25]">
                이 답장을
                <br />
                종이로 받아요
              </h2>
              <p className="m-0 max-w-[30em] text-base leading-[1.8] text-ink-2 mobile-down:text-sm">레터가 손으로 옮겨 적어 우편으로 보내요. 받으실 주소를 적어 주세요.</p>
            </div>
            <RequestForm letterId={reply._id} />
          </div>
        </section>
      )}
    </main>
  );
}
