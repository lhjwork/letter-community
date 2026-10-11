"use client";

import { useState } from "react";
import type { Address, AddressInput } from "@/types/address";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PostcodeSearch from "./PostcodeSearch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 실패하면 Error 를 던진다. 메시지는 모달 안에 보인다 */
  onSubmit: (data: AddressInput) => Promise<void>;
  editAddress?: Address | null;
}

const LABEL = "flex flex-col gap-1.5";
const LABEL_TXT = "font-pen text-xl";

function formatPhone(raw: string) {
  const n = raw.replace(/\D/g, "").slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
}

const fromAddress = (a?: Address | null) => ({
  recipientName: a?.recipientName ?? "",
  phone: a?.phone ?? "",
  zipCode: a?.zipCode ?? "",
  address: a?.address ?? "",
  addressDetail: a?.addressDetail ?? "",
  isDefault: a?.isDefault ?? false,
});

/** 주소 입력 모달 (v8-Modals-2 AddressFormModal). 모바일은 아래에서 올라오는 전체 폭 시트 */
export default function AddressFormModal({ open, onOpenChange, onSubmit, editAddress }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="paper max-w-[520px] gap-4 rounded-none border-rule bg-paper px-9 pb-8 pt-10 shadow-[var(--paper-shadow)] mobile-down:bottom-0 mobile-down:top-auto mobile-down:max-w-none mobile-down:translate-y-0 mobile-down:px-5 mobile-down:pb-6 mobile-down:pt-9"
      >
        <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
        <span className="stampbox absolute -top-4 left-6 bg-paper text-ink mobile-down:left-4 mobile-down:text-[22px]">주소 입력</span>
        <DialogClose aria-label="닫기" className="absolute right-3.5 top-3.5 z-10 inline-flex h-11 w-11 items-center justify-center font-pen text-[26px] text-ink-3">
          ✕
        </DialogClose>
        {/* key 로 열 때마다 폼을 새로 만든다(수정 대상이 바뀌어도 이전 값이 남지 않게) */}
        {open && <Form key={editAddress?._id ?? "new"} editAddress={editAddress} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

function Form({ editAddress, onSubmit }: Pick<Props, "editAddress" | "onSubmit">) {
  const [f, setF] = useState(() => fromAddress(editAddress));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: "recipientName" | "phone" | "addressDetail") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const recipientName = f.recipientName.trim();
    if (!recipientName) return setError("받으실 분의 이름을 적어 주세요.");
    if (f.phone && !/^[\d-]+$/.test(f.phone)) return setError("연락처는 숫자와 - 만 적어 주세요.");
    if (!f.zipCode || !f.address) return setError("우편번호 검색으로 주소를 골라 주세요.");
    setError("");
    setBusy(true);
    try {
      await onSubmit({
        // 예전에 적은 배송지명은 그대로 둔다. 새 주소는 서버가 이름으로 채운다
        ...(editAddress?.addressName ? { addressName: editAddress.addressName } : {}),
        recipientName,
        phone: f.phone,
        zipCode: f.zipCode,
        address: f.address,
        addressDetail: f.addressDetail.trim(),
        isDefault: f.isDefault,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장하지 못했어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    // 스탬프가 종이 위로 걸치도록 스크롤은 종이가 아니라 폼에 둔다(낮은 화면에서도 저장 버튼까지 닿게)
    <form onSubmit={submit} className="-mx-1 flex max-h-[calc(90vh-72px)] flex-col gap-4 overflow-y-auto px-1">
      <DialogTitle className="m-0 mt-2 font-pen text-[30px] font-normal leading-[1.3]">받으실 분의 주소</DialogTitle>

      <label className={LABEL}>
        <span className={LABEL_TXT}>이름</span>
        <input type="text" required maxLength={50} value={f.recipientName} onChange={set("recipientName")} className="field" placeholder="수취인 이름" autoComplete="name" />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          연락처 <span className="text-base text-ink-3">(선택)</span>
        </span>
        <input type="tel" inputMode="numeric" value={f.phone} onChange={set("phone")} className="field" placeholder="010-0000-0000" autoComplete="tel" />
      </label>
      <div className={LABEL}>
        <label htmlFor="addr-zip" className={LABEL_TXT}>
          주소
        </label>
        <span className="flex gap-2">
          <input id="addr-zip" type="text" readOnly value={f.zipCode} className="field min-w-0 flex-[1_1_120px]" placeholder="우편번호" />
          <PostcodeSearch
            onComplete={(d) => setF((s) => ({ ...s, zipCode: d.zipCode, address: d.address }))}
            className="btn btn-ink whitespace-nowrap text-xl mobile-down:px-4 mobile-down:text-lg"
          />
        </span>
      </div>
      <input type="text" readOnly value={f.address} className="field" placeholder="주소" aria-label="기본 주소" />
      <input type="text" maxLength={100} value={f.addressDetail} onChange={set("addressDetail")} className="field" placeholder="상세주소 (동/호수 등)" aria-label="상세 주소" />
      <label className="flex min-h-11 items-center gap-2.5 self-start text-sm text-ink-2">
        <input type="checkbox" checked={f.isDefault} onChange={(e) => setF((s) => ({ ...s, isDefault: e.target.checked }))} className="h-[18px] w-[18px] accent-ink" />
        기본 배송지로
      </label>
      {error && (
        <p role="alert" className="m-0 text-[15px] text-brick">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2.5">
        <DialogClose type="button" className="btn btn-ink">
          취소
        </DialogClose>
        <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-brick">
          {busy ? "저장하는 중" : "저장"}
        </button>
      </div>
    </form>
  );
}
