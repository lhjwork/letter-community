import Link from "next/link";
import type { StoryReply } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";

const PAPERS = ["bg-[#FFFDF8]", "bg-[#FBF6EC]", "bg-[#F7F1E3]"];
const TILTS = ["-rotate-[0.5deg]", "rotate-[0.6deg]", "-rotate-[0.7deg]", "rotate-[0.4deg]"];

/** 답장 한 통 = 괘선 종이 + 테이프. 본문은 8줄 미리보기, 끝까지 읽기는 답장 화면(/letter/{답장 id})에서 */
export default function ReplyCard({ reply, index }: { reply: StoryReply; index: number }) {
  const p = seoulParts(reply.createdAt);
  const body = (reply.plainContent || reply.ogPreviewText || "").trim();
  const badge = reply.isAdminReply ? ["레터의 답장", "bg-brick"] : reply.isAdopted ? ["채택", "bg-approve"] : ["답장", "bg-ink-3"];
  return (
    <article className={`paper ruled flex max-w-[640px] flex-col px-8 py-9 shadow-[0_6px_0_-3px_#E3DACB] mobile-down:px-5 ${PAPERS[index % PAPERS.length]} ${TILTS[index % TILTS.length]}`}>
      <span className="tape left-6 -rotate-[3deg]" aria-hidden="true" />
      <div className="flex h-9 items-center justify-between gap-2">
        <span className={`truncate font-pen text-2xl ${reply.isAdminReply ? "text-brick" : "text-ink"}`}>From. {reply.isAdminReply ? "레터" : reply.authorName}</span>
        <span className={`badge shrink-0 ${badge[1]}`}>{badge[0]}</span>
      </div>
      <p className="m-0 line-clamp-8 whitespace-pre-line font-pen text-[26px] leading-9 mobile-down:text-2xl">{body}</p>
      <div className="mt-9 flex min-h-9 flex-wrap items-center justify-between gap-2">
        <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
          {p.mm}.{p.dd} · {p.wd}
        </span>
        <Link href={`/letter/${reply._id}`} className="inline-flex min-h-11 items-center font-pen text-xl text-ink-2 hover:text-brick" aria-label={`${reply.isAdminReply ? "레터" : reply.authorName}의 답장 읽기`}>
          <span className="border-b-[1.5px] border-current">답장 읽기 →</span>
        </Link>
      </div>
    </article>
  );
}
