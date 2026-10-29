import Link from "next/link";
import { useTranslations } from "next-intl";
import type { StoryReply } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";

const PAPERS = ["bg-[#FFFDF8]", "bg-[#FBF6EC]", "bg-[#F7F1E3]"];
const TILTS = ["-rotate-[0.5deg]", "rotate-[0.6deg]", "-rotate-[0.7deg]", "rotate-[0.4deg]"];

/** 답장 한 통 = 괘선 종이 + 테이프. 본문은 8줄 미리보기, 끝까지 읽기는 답장 화면(/letter/{답장 id})에서 */
export default function ReplyCard({ reply, index }: { reply: StoryReply; index: number }) {
  const t = useTranslations("letter");
  const p = seoulParts(reply.createdAt);
  const name = reply.isAdminReply ? t("names.letter") : reply.authorName;
  const body = (reply.plainContent || reply.ogPreviewText || "").trim();
  const badge = reply.isAdminReply ? [t("replyCard.adminReply"), "bg-brick"] : reply.isAdopted ? [t("replyCard.adopted"), "bg-approve"] : [t("replyCard.reply"), "bg-ink-3"];
  return (
    <article className={`paper ruled flex max-w-[640px] flex-col px-8 py-9 shadow-[0_6px_0_-3px_#E3DACB] mobile-down:px-5 ${PAPERS[index % PAPERS.length]} ${TILTS[index % TILTS.length]}`}>
      <span className="tape left-6 -rotate-[3deg]" aria-hidden="true" />
      <div className="flex h-9 items-center justify-between gap-2">
        <span className={`truncate font-pen text-2xl ${reply.isAdminReply ? "text-brick" : "text-ink"}`}>From. {name}</span>
        <span className={`badge shrink-0 ${badge[1]}`}>{badge[0]}</span>
      </div>
      <p className="m-0 line-clamp-8 whitespace-pre-line font-pen text-[26px] leading-9 mobile-down:text-2xl">{body}</p>
      <div className="mt-9 flex min-h-9 flex-wrap items-center justify-between gap-2">
        <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
          {p.mm}.{p.dd} · {p.wd}
        </span>
        <Link href={`/letter/${reply._id}`} className="inline-flex min-h-11 items-center font-pen text-xl text-ink-2 hover:text-brick" aria-label={t("replyCard.readLabel", { name })}>
          <span className="border-b-[1.5px] border-current">{t("replyCard.read")}</span>
        </Link>
      </div>
    </article>
  );
}
