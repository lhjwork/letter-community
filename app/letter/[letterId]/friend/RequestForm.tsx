"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { track } from "@/lib/analytics/ga";
import { apiRequest } from "@/lib/api";
import { getAddresses } from "@/lib/address-api";
import PostcodeSearch from "@/components/address/PostcodeSearch";
import V8Dialog, { V8Title } from "@/components/ui/V8Dialog";
import type { Address } from "@/types/address";
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
  const t = useTranslations("letter.requestForm");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const [f, setF] = useState({ name: "", phone: "", zipCode: "", address1: "", address2: "", memo: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);
  // 로그인한 사용자의 주소록. null = 비로그인이거나 아직 못 받음(버튼·안내 모두 숨김)
  const [book, setBook] = useState<Address[] | null>(null);
  const [picking, setPicking] = useState(false);
  const token = session?.backendToken;

  useEffect(() => {
    setPrev(localStorage.getItem(requestKey(letterId)));
  }, [letterId]);

  useEffect(() => {
    if (!token) return setBook(null);
    let alive = true;
    getAddresses(token)
      .then((r) => alive && setBook(r.data ?? []))
      .catch(() => alive && setBook(null));
    return () => {
      alive = false;
    };
  }, [token]);

  // 남의 편지를 신청하는 경우도 있어 기본 배송지를 미리 채우지 않는다. 고른 것만 채움
  const pick = (a: Address) => {
    setF((s) => ({ ...s, name: a.recipientName, phone: formatPhone(a.phone || a.tel || ""), zipCode: a.zipCode, address1: a.address, address2: a.addressDetail ?? "" }));
    setError("");
    setPicking(false);
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = f.name.trim();
    if (name.length < 2 || name.length > 50) return setError(t("errorName"));
    if (f.phone && !/^01\d-\d{3,4}-\d{4}$/.test(f.phone)) return setError(t("errorPhone"));
    if (!/^\d{5}$/.test(f.zipCode) || f.address1.length < 5) return setError(t("errorAddress"));
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
      setError(err instanceof Error ? err.message : t("errorSubmit"));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-[1_1_380px] flex-col gap-3.5 mobile-down:mt-1 mobile-down:flex-none mobile-down:gap-3">
      {/* 배송은 국내만(다음 우편번호 검색·5자리 우편번호). 한국어 화면은 기존 그대로 */}
      {locale !== "ko" && <p className="m-0 text-[15px] leading-[1.8] text-ink-2">{t("koreaOnly")}</p>}
      {prev && (
        <a href={`/letter/${letterId}/request/${prev}`} className="inline-flex min-h-11 items-center self-start font-pen text-xl text-ink-2 hover:text-brick">
          <span className="border-b-[1.5px] border-current">{t("viewPrevious")}</span>
        </a>
      )}
      {book && book.length > 0 && (
        <button type="button" onClick={() => setPicking(true)} className="btn btn-blue min-h-11 self-start px-4 text-xl">
          {t("loadAddressBook")}
        </button>
      )}
      {book && book.length === 0 && <p className="m-0 text-[15px] leading-[1.8] text-ink-2">{t("addressBookHint")}</p>}
      <label className={LABEL}>
        <span className={LABEL_TXT}>{t("name")}</span>
        <input type="text" name="name" value={f.name} onChange={set("name")} maxLength={50} autoComplete="name" required className="field" placeholder={t("name")} />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          {t("phone")} <span className="text-base text-ink-3">{t("optional")}</span>
        </span>
        <input type="tel" name="phone" value={f.phone} onChange={set("phone")} inputMode="numeric" autoComplete="tel" className="field" placeholder="010-0000-0000" />
      </label>
      <label className={LABEL}>
        <span className={LABEL_TXT}>{t("address")}</span>
        <span className="flex flex-wrap gap-2">
          <input type="text" name="zipCode" value={f.zipCode} readOnly className="field flex-[1_1_120px]" placeholder={t("zipCode")} />
          <PostcodeSearch
            onComplete={(d) => setF((s) => ({ ...s, zipCode: d.zipCode, address1: d.address }))}
            className="btn btn-ink min-h-12 whitespace-nowrap text-xl mobile-down:px-3.5 mobile-down:text-lg"
            buttonText={
              <span>
                <span className="mobile-down:hidden">{t("searchPrefix")}</span>
                {t("search")}
              </span>
            }
          />
        </span>
      </label>
      <input type="text" name="address1" value={f.address1} readOnly aria-label={t("address1")} className="field" placeholder={t("address1")} />
      <input type="text" name="address2" value={f.address2} onChange={set("address2")} maxLength={200} aria-label={t("address2Label")} className="field" placeholder={t("address2Placeholder")} />
      <label className={LABEL}>
        <span className={LABEL_TXT}>
          {t("memo")} <span className="text-base text-ink-3">{t("optional")}</span>
        </span>
        <input type="text" name="memo" value={f.memo} onChange={set("memo")} maxLength={500} className="field" placeholder={t("memoPlaceholder")} />
      </label>
      {error && (
        <p role="alert" className="m-0 text-sm leading-[1.8] text-brick">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-brick mt-1.5 min-h-14 text-[26px] mobile-down:mt-1">
        {busy ? t("submitting") : t("submit")}
      </button>

      <V8Dialog open={picking} onOpenChange={setPicking} stamp={t("bookStamp")} stampTone="text-airblue" width="max-w-[520px]">
        <V8Title className="m-0 font-pen text-[30px] font-normal leading-[1.3] mobile-down:text-[28px]">{t("bookTitle")}</V8Title>
        <ul className="m-0 flex max-h-[min(420px,60dvh)] list-none flex-col gap-2.5 overflow-y-auto p-0 mobile-down:max-h-none mobile-down:overflow-visible">
          {book?.map((a) => (
            <li key={a._id}>
              <button
                type="button"
                onClick={() => pick(a)}
                className="flex min-h-11 w-full cursor-pointer flex-col items-start gap-1 rounded-[3px] border-[1.5px] border-rule bg-paper px-4 py-3 text-left text-ink hover:border-airblue focus-visible:border-airblue"
              >
                <span className="flex items-center gap-2">
                  <span className="font-pen text-2xl">{a.recipientName}</span>
                  {a.isDefault && <span className="badge bg-approve">{t("defaultAddress")}</span>}
                </span>
                <span className="text-[15px] leading-[1.7] text-ink-2">
                  ({a.zipCode}) {a.address}
                  {a.addressDetail ? `, ${a.addressDetail}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </V8Dialog>
    </form>
  );
}
