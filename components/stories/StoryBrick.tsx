import Link from "next/link";
import type { Story } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";

// v8-StoriesMasonry 카드 변주 순환: 종이색 3종, 기울기 ±0.4~0.8°, 테이프 위치·각도 교대
const PAPERS = ["bg-[#FFFDF8]", "bg-[#FBF6EC]", "bg-[#F7F1E3]", "bg-[#F4F6F2]", "bg-[#FBF3EE]"];
const TILTS = ["-rotate-[0.6deg]", "rotate-[0.7deg]", "rotate-[0.4deg]", "-rotate-[0.8deg]", "rotate-[0.5deg]", "-rotate-[0.5deg]", "rotate-[0.6deg]", "-rotate-[0.4deg]"];
const TAPES = ["left-[22px] rotate-[4deg]", "left-[40%] -rotate-[3deg]"];

/** 사연 목록 벽돌 카드. 괘선 36px 위에 모든 줄이 앉는다(line-height 36, 세로 여백 36 배수) */
export default function StoryBrick({ story, index }: { story: Story; index: number }) {
  const n = story.replyCount ?? 0;
  const p = seoulParts(story.createdAt);
  const preview = story.preview ?? (story.content ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
  return (
    <Link
      href={`/letter/${story._id}`}
      className={`ruled relative mb-7 flex break-inside-avoid flex-col border border-rule px-[26px] py-9 text-ink shadow-[0_6px_0_-3px_#E3DACB] hover:text-ink mobile-down:px-5 ${PAPERS[index % PAPERS.length]} ${TILTS[index % TILTS.length]}`}
    >
      {/* top:-10px 이면 단(column) 맨 위 카드의 테이프가 앞 단 바닥에 찍힌다(다단 조각). 0 에 두고 transform 으로 올린다 */}
      <span className={`tape top-0 -translate-y-2.5 ${TAPES[index % TAPES.length]}`} aria-hidden="true" />
      <span className={`badge absolute right-4 top-3.5 ${n > 0 ? "bg-airblue" : "bg-brick"}`}>{n > 0 ? `답장 ${n}` : "답장 기다림"}</span>
      <span className="font-pen text-lg leading-9 text-brick">To. {story.recipientName || "레터"}</span>
      <strong className="relative -top-0.5 font-pen text-[26px] font-normal leading-9 mobile-down:text-2xl">{story.title || preview}</strong>
      {story.title && preview && <span className="line-clamp-3 text-base leading-9 text-ink-2">{preview}</span>}
      <span className="mt-9 flex h-9 items-center justify-between text-xs text-ink-3">
        <span className="chip min-h-7 px-2.5 text-base">{story.category || "기타"}</span>
        <span className="font-anton tracking-[0.1em]">
          {p.mm}.{p.dd} · {p.wd}
        </span>
      </span>
      {n >= 3 && (
        <span className="post absolute bottom-9 right-3.5 h-14 w-14 rotate-[14deg] text-[9px] opacity-60" aria-hidden="true">
          SEOUL<span className="text-xs">26</span>
        </span>
      )}
    </Link>
  );
}
