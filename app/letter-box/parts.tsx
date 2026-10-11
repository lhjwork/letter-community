import Link from "next/link";

export const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** "서울 성동구 성수이로 00" → "서울 성동구" (작성자 화면은 구 단위까지만) */
export const region = (address = "") => address.trim().split(/\s+/).slice(0, 2).join(" ");

/** 밑줄 링크: 44px 터치 영역은 바깥, 밑줄은 글자 바로 아래(안쪽 span) */
export function UnderLink({ href, className = "", children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`inline-flex min-h-11 items-center text-airblue hover:text-brick ${className}`}>
      <span className="border-b border-current">{children}</span>
    </Link>
  );
}

// 보드 v8-LetterBox 신청 현황 단계. 지난 단계 녹색, 지금 단계 잉크, 남은 단계 괘선색
const STEPS = [
  ["approved", "승인됨"],
  ["writing", "손글씨 작성 중"],
  ["sent", "발송"],
  ["delivered", "배송 완료"],
] as const;

/** 신청 상태 짧은 이름 (배지·한 줄 요약용) */
export const STATUS_SHORT: Record<string, string> = { requested: "승인 대기", rejected: "거절됨", ...Object.fromEntries(STEPS) };

export function RequestSteps({ status, className = "" }: { status: string; className?: string }) {
  if (status === "requested" || status === "rejected")
    return (
      <p className={`m-0 ${className}`}>
        <span className={`badge ${status === "requested" ? "bg-brick" : "bg-ink-3"}`}>{STATUS_SHORT[status]}</span>
      </p>
    );
  const cur = STEPS.findIndex(([s]) => s === status);
  return (
    <ol aria-label="진행 단계" className={`m-0 flex list-none flex-wrap gap-2 p-0 mobile-down:gap-1.5 ${className}`}>
      {STEPS.map(([s, label], i) => (
        <li key={s} aria-current={i === cur ? "step" : undefined} className={`badge ${i < cur ? "bg-approve" : i === cur ? "bg-ink" : "bg-rule text-ink-2"}`}>
          {label}
        </li>
      ))}
    </ol>
  );
}

/** 이전·다음 쪽. 무한 스크롤 대신 쪽 이동 */
export function Pager({ page, totalPages, href }: { page: number; totalPages: number; href: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="쪽 이동" className="flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-ink min-h-11 px-5 text-xl">
          이전
        </Link>
      ) : null}
      <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn btn-ink min-h-11 px-5 text-xl">
          다음
        </Link>
      ) : null}
    </nav>
  );
}
