import Image from "next/image";
import { LetterBody } from "../story/StoryDetail";
import LetterSheet from "@/components/LetterSheet";
import AuthorRequests from "./AuthorRequests";
import { AuthorActions, ReaderActions } from "./FriendActions";
import RequestForm from "./RequestForm";
import { ENVELOPE_NAME, formatKoDate } from "./status";

export type FriendLetter = {
  _id: string;
  title?: string;
  ogTitle?: string;
  ogPreviewText?: string;
  content: string;
  contentType?: "text" | "html";
  senderName?: string;
  recipientName?: string;
  envelope?: string;
  isAuthor?: boolean;
  createdAt: string;
  authorSettings: { allowPhysicalRequests: boolean };
};

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** v8-LetterOpen / M-LetterOpen. 작성자에게는 같은 자리에 "내가 쓴 편지"와 수정·삭제·신청 관리 */
export default function FriendDetail({ letter }: { letter: FriendLetter }) {
  const isAuthor = !!letter.isAuthor;
  const title = letter.ogTitle || letter.title || "당신에게 도착한 편지";
  const canRequest = !isAuthor && letter.authorSettings.allowPhysicalRequests;
  const envelope = `${ENVELOPE_NAME[letter.envelope ?? ""] ?? "성수"} 봉투`;

  return (
    <main className="flex flex-col">
      <section className={`${WRAP} flex flex-col items-center gap-3.5 pb-9 pt-5 text-center mobile-down:gap-2.5 mobile-down:pb-6 mobile-down:pt-2`}>
        <Image src="/v8/envelope-small.png" alt="" width={64} height={56} className="h-14 w-16 object-contain mobile-down:h-12 mobile-down:w-14" priority />
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{isAuthor ? "내가 쓴 편지" : "당신에게 도착한 편지"}</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-4xl">{title}</h1>
        <p className="m-0 text-sm text-ink-3 mobile-down:text-[13px]">{formatKoDate(letter.createdAt)} · 마음 편지</p>
      </section>

      <section className={`${WRAP} flex flex-col items-center pb-16 mobile-down:pb-10 mobile-down:pt-4`}>
        <LetterSheet label="마음 편지">
          <span className="stampbox absolute -top-4 left-7 bg-paper text-airblue mobile-down:left-4 mobile-down:text-[22px]">마음 편지</span>
          <p className="m-0 font-pen text-[26px] text-brick mobile-down:text-[20px]">To. {letter.recipientName || "당신"}</p>
          <LetterBody content={letter.content} contentType={letter.contentType} />
          <p className="m-0 mt-auto self-end font-pen text-[26px] text-ink-2 mobile-down:text-[20px]">From. {letter.senderName || "익명"}</p>
        </LetterSheet>

        {isAuthor ? <AuthorActions letterId={letter._id} /> : <ReaderActions letterId={letter._id} canRequest={canRequest} />}
      </section>

      {canRequest && (
        <section id="request" className={`${WRAP} scroll-mt-6 pb-24 mobile-down:pb-12`}>
          <div className="relative flex flex-wrap items-start gap-10 border border-rule bg-paper p-12 mobile-down:flex-col mobile-down:items-stretch mobile-down:gap-3.5 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-9">
            <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
            <div className="airmail absolute inset-x-0 bottom-0 h-2 mobile-down:hidden" aria-hidden="true" />
            <div className="flex flex-[1_1_380px] flex-col gap-3.5 mobile-down:flex-none">
              <h2 className="m-0 font-pen text-[40px] font-normal leading-[1.3] mobile-down:mt-1 mobile-down:text-[32px] mobile-down:leading-[1.25]">
                이 편지를
                <br />
                종이로 받아보세요
              </h2>
              <p className="m-0 max-w-[30em] text-base leading-[1.8] text-ink-2 mobile-down:text-sm">레터가 이 편지를 손글씨로 옮겨 적어 우편으로 보내드려요.</p>
              <p className="m-0 flex flex-wrap items-center gap-2.5 text-sm text-ink-2">
                <span className="badge bg-ink">봉투</span>
                <span>
                  <strong>{envelope}</strong>에 담아 보내드려요.
                </span>
              </p>
            </div>
            <RequestForm letterId={letter._id} />
          </div>
        </section>
      )}

      {isAuthor && (
        <section id="requests" className={`${WRAP} scroll-mt-6 pb-24 mobile-down:pb-12`}>
          <AuthorRequests letterId={letter._id} letterTitle={title} />
        </section>
      )}
    </main>
  );
}
