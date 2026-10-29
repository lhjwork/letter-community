"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Address, AddressInput } from "@/types/address";
import V8Dialog, { V8Close, V8Title } from "@/components/ui/V8Dialog";
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

/** 주소 입력 모달 (v8-Modals-2 AddressFormModal). 모바일은 M-Sheet 바닥 시트(V8Dialog) */
export default function AddressFormModal({ open, onOpenChange, onSubmit, editAddress }: Props) {
  const t = useTranslations("shared.address");
  return (
    <V8Dialog open={open} onOpenChange={onOpenChange} stamp={t("stamp")} width="max-w-[520px]">
        {/* key 로 열 때마다 폼을 새로 만든다(수정 대상이 바뀌어도 이전 값이 남지 않게) */}
        {open && <Form key={editAddress?._id ?? "new"} editAddress={editAddress} onSubmit={onSubmit} />}
    </V8Dialog>
  );
}

function Form({ editAddress, onSubmit }: Pick<Props, "editAddress" | "onSubmit">) {
  const t = useTranslations("shared.address");
  const [f, setF] = useState(() => fromAddress(editAddress));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: "recipientName" | "phone" | "addressDetail") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const recipientName = f.recipientName.trim();
    if (!recipientName) return setError(t("errName"));
    if (f.phone && !/^[\d-]+$/.test(f.phone)) return setError(t("errPhone"));
    if (!f.zipCode || !f.address) return setError(t("errAddress"));
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
      setError(err instanceof Error ? err.message : t("errSave"));
      setBusy(false);
    }
  };

  return (
    // 스탬프가 종이 위로 걸치도록 스크롤은 종이가 아니라 폼에 둔다(낮은 화면에서도 저장 버튼까지 닿게)
    <form onSubmit={submit} noValidate className="-mx-1 flex max-h-[calc(90vh-72px)] flex-col gap-4 overflow-y-auto px-1 mobile-down:max-h-none mobile-down:gap-3 mobile-down:overflow-visible">
      <V8Title className="m-0 mt-2 font-pen text-[30px] font-normal leading-[1.3] mobile-down:mt-0 mobile-down:text-[28px]">{t("title")}</V8Title>

      <label className={LABEL}>
        <span className={LABEL_TXT}>{t("name")}</span>
        <input type="text" required maxLength={50} value={f.recipientName} onChange={set("recipientName")} className="field" placeholder={t("namePlaceholder")} autoComplete="name" />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          {t("phone")} <span className="text-base text-ink-3">{t("optional")}</span>
        </span>
        <input type="tel" inputMode="numeric" value={f.phone} onChange={set("phone")} className="field" placeholder="010-0000-0000" autoComplete="tel" />
      </label>
      <div className={LABEL}>
        <label htmlFor="addr-zip" className={LABEL_TXT}>
          {t("address")}
        </label>
        <span className="flex flex-wrap gap-2">
          <input id="addr-zip" type="text" readOnly value={f.zipCode} className="field min-w-0 flex-[1_1_120px]" placeholder={t("zipPlaceholder")} />
          <PostcodeSearch
            onComplete={(d) => setF((s) => ({ ...s, zipCode: d.zipCode, address: d.address }))}
            className="btn btn-ink whitespace-nowrap text-xl mobile-down:px-4 mobile-down:text-lg"
          />
        </span>
      </div>
      <input type="text" readOnly value={f.address} className="field" placeholder={t("addressPlaceholder")} aria-label={t("addressLabel")} />
      <input type="text" maxLength={100} value={f.addressDetail} onChange={set("addressDetail")} className="field" placeholder={t("detailPlaceholder")} aria-label={t("detailLabel")} />
      <label className="flex min-h-11 items-center gap-2.5 self-start text-sm text-ink-2">
        <input type="checkbox" checked={f.isDefault} onChange={(e) => setF((s) => ({ ...s, isDefault: e.target.checked }))} className="h-[18px] w-[18px] accent-ink" />
        {t("setDefault")}
      </label>
      {error && (
        <p role="alert" className="m-0 text-[15px] text-brick">
          {error}
        </p>
      )}
      <div className="dlg-actions">
        <V8Close type="button" className="btn btn-ink">
          {t("cancel")}
        </V8Close>
        <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-brick">
          {busy ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
