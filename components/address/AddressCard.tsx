import { useTranslations } from "next-intl";
import type { Address } from "@/types/address";

const TILTS = ["-rotate-[0.5deg]", "rotate-[0.6deg]", "-rotate-[0.4deg]"];

interface Props {
  address: Address;
  index: number;
  busy?: boolean;
  onEdit: (a: Address) => void;
  onDelete: (a: Address) => void;
  onSetDefault: (a: Address) => void;
}

/** 주소록 카드 (v8-Addresses). 연락처가 없으면 "연락처 없음" */
export default function AddressCard({ address: a, index, busy, onEdit, onDelete, onSetDefault }: Props) {
  const t = useTranslations("shared.address");
  return (
    <article className={`card gap-1.5 pb-5 mobile-down:px-5 mobile-down:pb-4 mobile-down:pt-6 ${TILTS[index % TILTS.length]}`}>
      <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mt-1 flex items-center justify-between gap-2">
        <h2 className="m-0 font-pen text-[26px] font-normal">{a.recipientName}</h2>
        {a.isDefault ? (
          <span className="badge bg-approve">{t("defaultBadge")}</span>
        ) : (
          <button type="button" disabled={busy} onClick={() => onSetDefault(a)} className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent font-pen text-lg text-airblue hover:text-brick">
            <span className="border-b border-current">{t("makeDefault")}</span>
          </button>
        )}
      </div>
      <span className="text-sm text-ink-2">{a.phone || t("noPhone")}</span>
      <span className="text-[15px] leading-[1.7]">
        ({a.zipCode}) {a.address}
        {a.addressDetail ? `, ${a.addressDetail}` : ""}
      </span>
      <div className="mt-2.5 flex gap-2">
        <button type="button" onClick={() => onEdit(a)} className="btn btn-ink min-h-11 px-3.5 text-lg" aria-label={t("editLabel", { name: a.recipientName })}>
          {t("edit")}
        </button>
        <button type="button" onClick={() => onDelete(a)} className="btn min-h-11 border-rule px-3.5 text-lg text-ink-3" aria-label={t("deleteLabel", { name: a.recipientName })}>
          {t("delete")}
        </button>
      </div>
    </article>
  );
}
