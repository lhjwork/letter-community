import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyInquiries } from "@/lib/api";
import { seoulParts } from "@/lib/seoulDate";
import { WRAP } from "@/app/letter-box/parts";
import JumpLink from "@/components/ui/JumpLink";
import InquiryForm from "./InquiryForm";
import { INQUIRY_STATUS } from "./status";

export const metadata: Metadata = { title: "문의하기" };

export default async function InquiryPage() {
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/?login=/inquiry");
  const mine = await getMyInquiries(token).catch(() => null);

  return (
    <main>
      <section className={`${WRAP} flex flex-col gap-3 pb-9 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">궁금한 점이나 불편한 점을 남겨 주세요</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">문의하기</h1>
        {/* 좁은 화면에선 내 문의가 폼 아래라 답변 확인 길을 위에 둔다(화면 순서 = 키보드 순서 유지) */}
        {!!mine?.length && (
          <JumpLink to="mine" className="hidden min-h-11 items-center self-start font-pen text-xl text-airblue hover:text-brick tablet-down:inline-flex">
            <span className="border-b border-current">내 문의 {mine.length}건 보기 ↓</span>
          </JumpLink>
        )}
      </section>

      <section className={`${WRAP} grid grid-cols-[minmax(0,1fr)_minmax(0,440px)] items-start gap-12 pb-24 tablet-down:grid-cols-1 mobile-down:gap-10 mobile-down:pb-12`}>
        <InquiryForm />

        <div id="mine" className="flex scroll-mt-6 flex-col gap-5">
          <h2 className="m-0 border-b-2 border-ink pb-2 font-pen text-[32px] font-normal mobile-down:text-[28px]">내 문의</h2>
          {!mine ? (
            <p className="m-0 font-pen text-[22px] text-ink-2">내 문의를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>
          ) : mine.length === 0 ? (
            <p className="m-0 font-pen text-[22px] text-ink-2">아직 남긴 문의가 없어요.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {mine.map((q) => {
                const d = seoulParts(q.createdAt);
                const s = INQUIRY_STATUS[q.status];
                return (
                  <li key={q._id} className="border-b border-rule">
                    <Link href={`/inquiry/${q._id}`} className="flex min-h-[72px] flex-col justify-center gap-1 py-3 text-ink hover:text-brick">
                      <span className="flex items-center gap-2.5 text-[13px] text-ink-2">
                        <span className={`badge ${s.bg}`}>{s.text}</span>
                        {q.category}
                        <span className="ml-auto font-anton text-xs tracking-[0.1em] text-ink-3">
                          {d.yyyy}.{d.mm}.{d.dd}
                        </span>
                      </span>
                      <span className="font-pen text-2xl leading-9">{q.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
