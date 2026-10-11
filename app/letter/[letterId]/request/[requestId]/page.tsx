import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PHYSICAL_STATUS, formatKoDate } from "../../friend/status";

export const metadata: Metadata = { title: "실물 편지 신청 상태" };

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

type Status = {
  letterTitle: string;
  status: string;
  rejectionReason?: string | null;
  recipientInfo: { name: string; address: string };
  statusHistory: { requested: string };
};

/** 신청 뒤 도착하는 상태 페이지. requestId 를 아는 사람만 볼 수 있고 주소는 신청자가 적은 그대로 */
export default async function Page({ params }: { params: Promise<{ letterId: string; requestId: string }> }) {
  const { letterId, requestId } = await params;
  const res = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-request/${encodeURIComponent(requestId)}`, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) notFound();
  const { data }: { data: Status } = await res.json();

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-10 px-6 pb-24 pt-5 mobile-down:gap-6 mobile-down:px-4 mobile-down:pb-12">
      <Link href={`/letter/${letterId}`} className="inline-flex min-h-11 items-center self-start font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
        ← 편지로 돌아가기
      </Link>
      <article className="paper flex flex-col gap-3.5 px-12 pb-12 pt-14 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-10">
        <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
        <span className="stampbox absolute -top-4 left-6 bg-paper text-ink mobile-down:left-4 mobile-down:text-[22px]">실물 편지</span>
        <h1 className="m-0 font-pen text-[40px] font-normal leading-[1.3] mobile-down:text-[32px]">{data.letterTitle}</h1>
        <p className="m-0 font-pen text-[28px] leading-9 text-brick mobile-down:text-[26px]">{PHYSICAL_STATUS[data.status] ?? data.status}</p>
        {data.rejectionReason && <p className="m-0 text-base leading-[1.8] text-ink-2">{data.rejectionReason}</p>}
        <p className="m-0 text-base leading-[1.8] text-ink-2">
          {data.recipientInfo.name} · {data.recipientInfo.address}
        </p>
        <p className="m-0 text-sm text-ink-3">{formatKoDate(data.statusHistory.requested)}에 신청했어요.</p>
      </article>
    </main>
  );
}
