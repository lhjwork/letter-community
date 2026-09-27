"use client";

import { useState } from "react";
import PostcodeSearch from "@/components/address/PostcodeSearch";
import { showAlert } from "@/components/ui/AppAlert";
import { DIARY_BINDINGS, requestDiaryPhysical, type DiaryAddress, type DiaryBinding, type DiaryPhysical } from "@/lib/diary-api";

interface Props {
  diaryId: string;
  token: string;
  writtenCount: number;
  onDone: (physical: DiaryPhysical) => void;
  onCancel: () => void;
}

const input = "w-full border border-[#C4C4C4] rounded-md px-3 py-2 text-base focus:outline-none focus:border-[#FF9883]";

/** 실물 다이어리 신청 폼. 주소 규칙은 실물 편지와 같다 */
export default function PhysicalRequestForm({ diaryId, token, writtenCount, onDone, onCancel }: Props) {
  const [binding, setBinding] = useState<DiaryBinding>("spring");
  const [copies, setCopies] = useState(1);
  const [addr, setAddr] = useState<DiaryAddress>({ name: "", phone: "", zipCode: "", address1: "", address2: "", memo: "" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k: keyof DiaryAddress) => (e: React.ChangeEvent<HTMLInputElement>) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await requestDiaryPhysical(diaryId, { binding, copies, address: addr }, token);
      onDone(r.data);
    } catch (e) {
      showAlert(e instanceof Error ? e.message : "신청하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const ready = addr.name.length >= 2 && addr.phone && addr.zipCode && addr.address1;

  return (
    <div className="rounded-lg border border-[#FF9883] bg-white p-5 sm:p-6 text-[#424242]">
      <h2 className="text-2xl mb-1" style={{ fontFamily: "NanumJangMiCe, cursive" }}>종이 다이어리로 받기</h2>
      <p className="text-sm text-[#757575] mb-5">쓴 페이지 {writtenCount}장이 A5 크기로 그대로 인쇄됩니다. 신청 후에는 내용을 고칠 수 없어요.</p>

      <div className="flex flex-wrap gap-6 mb-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#757575]">제본</span>
          {DIARY_BINDINGS.map((b) => (
            <button key={b.id} onClick={() => setBinding(b.id)} className={`px-3 py-1 rounded-full border ${binding === b.id ? "border-[#FF9883] text-[#FF7F65]" : "border-[#C4C4C4]"}`} title={b.desc}>
              {b.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <span className="text-[#757575]">부수</span>
          <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="border border-[#C4C4C4] rounded-md px-2 py-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}권</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input value={addr.name} onChange={set("name")} placeholder="받는 분 성함" maxLength={50} className={input} />
        <input value={addr.phone} onChange={set("phone")} placeholder="휴대폰 번호 (010-0000-0000)" className={input} />
      </div>
      <div className="flex gap-2 mb-3">
        <input value={addr.zipCode} readOnly placeholder="우편번호" className={`${input} w-28 bg-[#FAFAFA]`} />
        <PostcodeSearch onComplete={(d) => setAddr((a) => ({ ...a, zipCode: d.zipCode, address1: d.address }))} className="shrink-0 px-4 rounded-md border border-[#C4C4C4] hover:border-[#FF9883] text-sm" />
      </div>
      <input value={addr.address1} readOnly placeholder="주소 (우편번호 검색으로 입력)" className={`${input} mb-3 bg-[#FAFAFA]`} />
      <input value={addr.address2} onChange={set("address2")} placeholder="상세 주소" maxLength={200} className={`${input} mb-3`} />
      <input value={addr.memo} onChange={set("memo")} placeholder="배송 메모 (선택)" maxLength={500} className={`${input} mb-5`} />

      <p className="text-xs text-[#9E9E9E] mb-4">비용은 신청 접수 후 안내드립니다. 첫 20권은 인쇄·배송 실비만 받습니다.</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-[#C4C4C4] hover:bg-gray-50">취소</button>
        <button onClick={submit} disabled={!ready || submitting} className="px-5 py-2 rounded-lg bg-[#FF9883] text-white hover:bg-[#ff8a70] disabled:opacity-50">
          {submitting ? "신청 중..." : "신청하기"}
        </button>
      </div>
    </div>
  );
}
