import Link from "next/link";
import type { StoryReply } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";

const PAPERS = ["bg-[#FFFDF8]", "bg-[#FBF6EC]", "bg-[#F7F1E3]"];
const TILTS = ["-rotate-[0.5deg]", "rotate-[0.6deg]", "-rotate-[0.7deg]", "rotate-[0.4deg]"];

/** 답장 한 통 = 괘선 종이 + 테이프. 관리자(레터) 답장·채택 답장만 "편지로 보기" */
export default function ReplyCard({ reply, index }: { reply: StoryReply; index: number }) {
  const p = seoulParts(reply.createdAt);
  const body = (reply.plainContent || reply.ogPreviewText || "").trim();
  const badge = reply.isAdminReply ? ["레터의 답장", "bg-brick"] : reply.isAdopted ? ["채택", "bg-approve"] : ["답장", "bg-ink-3"];
  const canOpen = reply.isAdminReply || reply.isAdopted;
  return (
    <article className={`paper ruled flex flex-col px-8 py-9 shadow-[0_6px_0_-3px_#E3DACB] mobile-down:px-5 ${PAPERS[index % PAPERS.length]} ${TILTS[index % TILTS.length]}`}>
      <span className="tape left-6 -rotate-[3deg]" aria-hidden="true" />
      <div className="flex h-9 items-center justify-between gap-2">
        <span className={`truncate font-pen text-2xl ${reply.isAdminReply ? "text-brick" : "text-ink"}`}>From. {reply.isAdminReply ? "레터" : reply.authorName}</span>
        <span className={`badge shrink-0 ${badge[1]}`}>{badge[0]}</span>
      </div>
      <p className="m-0 whitespace-pre-line text-[19px] leading-9">{body}</p>
      <div className="mt-9 flex min-h-9 flex-wrap items-center justify-between gap-2">
        <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
          {p.mm}.{p.dd} · {p.wd}
        </span>
        {canOpen && (
          <Link href={`/letter/${reply._id}`} className="btn btn-ink min-h-11 px-3.5 text-lg hover:text-ink mobile-down:px-3 mobile-down:text-[17px]">
            편지로 보기
          </Link>
        )}
      </div>
    </article>
  );
}
