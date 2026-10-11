"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { track } from "@/lib/analytics/ga";
import { apiRequest } from "@/lib/api";
import PostcodeSearch from "@/components/address/PostcodeSearch";
import { requestKey } from "./status";

const LABEL = "flex flex-col gap-1.5";
const LABEL_TXT = "font-pen text-xl";

function formatPhone(raw: string) {
  const n = raw.replace(/\D/g, "").slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
}

/** 실물 편지 신청(#request). 로그인 없이도 신청, 신청 뒤 상태 페이지로 */
export default function RequestForm({ letterId }: { letterId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [f, setF] = useState({ name: "", phone: "", zipCode: "", address1: "", address2: "", memo: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);

  useEffect(() => {
    setPrev(localStorage.getItem(requestKey(letterId)));
  }, [letterId]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = f.name.trim();
    if (name.length < 2 || name.length > 50) return setError("받으실 분의 이름을 2자 이상 적어 주세요.");
    if (f.phone && !/^01\d-\d{3,4}-\d{4}$/.test(f.phone)) return setError("연락처를 010-0000-0000 형식으로 적어 주세요.");
    if (!/^\d{5}$/.test(f.zipCode) || f.address1.length < 5) return setError("우편번호 검색으로 주소를 골라 주세요.");
    setError("");
    setBusy(true);
    try {
      const res = await apiRequest<{ data: { requestId: string; isDuplicate: boolean } }>(`/api/letters/${letterId}/physical-request`, {
        method: "POST",
        token: session?.backendToken,
        body: JSON.stringify({ address: { ...f, name, address2: f.address2.trim(), memo: f.memo.trim() } }),
      });
      const { requestId, isDuplicate } = res.data;
      localStorage.setItem(requestKey(letterId), requestId);
      track("physical_request", { letter_id: letterId, anonymous: !session, is_duplicate: isDuplicate });
      router.push(`/letter/${letterId}/request/${requestId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "신청을 보내지 못했어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-[1_1_380px] flex-col gap-3.5 mobile-down:mt-1 mobile-down:flex-none mobile-down:gap-3">
      {prev && (
        <a href={`/letter/${letterId}/request/${prev}`} className="inline-flex min-h-11 items-center self-start font-pen text-xl text-ink-2 hover:text-brick">
          <span className="border-b-[1.5px] border-current">이미 신청한 편지의 진행 보기</span>
        </a>
      )}
      <label className={LABEL}>
        <span className={LABEL_TXT}>받으실 분의 이름</span>
        <input type="text" name="name" value={f.name} onChange={set("name")} maxLength={50} autoComplete="name" required className="field" placeholder="받으실 분의 이름" />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          연락처 <span className="text-base text-ink-3">(선택)</span>
        </span>
        <input type="tel" name="phone" value={f.phone} onChange={set("phone")} inputMode="numeric" autoComplete="tel" className="field" placeholder="010-0000-0000" />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>주소</span>
        <span className="flex flex-wrap gap-2">
          <input type="text" name="zipCode" value={f.zipCode} readOnly className="field flex-[1_1_120px]" placeholder="우편번호" />
          <PostcodeSearch
            onComplete={(d) => setF((s) => ({ ...s, zipCode: d.zipCode, address1: d.address }))}
            className="btn btn-ink min-h-12 whitespace-nowrap text-xl mobile-down:px-3.5 mobile-down:text-lg"
            buttonText={
              <span>
                <span className="mobile-down:hidden">우편번호 </span>검색
              </span>
            }
          />
        </span>
      </label>
      <input type="text" name="address1" value={f.address1} readOnly aria-label="기본 주소" className="field" placeholder="기본 주소" />
      <input type="text" name="address2" value={f.address2} onChange={set("address2")} maxLength={200} aria-label="상세 주소" className="field" placeholder="동, 호수 등 상세주소" />
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          참고 사항 <span className="text-base text-ink-3">(선택)</span>
        </span>
        <input type="text" name="memo" value={f.memo} onChange={set("memo")} maxLength={500} className="field" placeholder="배송 시 참고할 사항" />
      </label>
      {error && (
        <p role="alert" className="m-0 text-sm leading-[1.8] text-brick">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-brick mt-1.5 min-h-14 text-[26px] mobile-down:mt-1">
        {busy ? "신청하는 중" : "실물 편지 신청"}
      </button>
    </form>
  );
}
