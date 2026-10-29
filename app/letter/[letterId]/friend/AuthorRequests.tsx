"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";
import V8Dialog, { V8Close, V8Title } from "@/components/ui/V8Dialog";
import { seoulParts } from "@/lib/seoulDate";

type Req = {
  requestId: string;
  name: string;
  region: string; // 구 단위까지(서울 성동구)
  status: string;
  requestedAt: string;
};

/** 작성자용 실물 편지 신청 목록 + 승인/거절 (v8-Modals-2 "신청 거절") */
export default function AuthorRequests({ letterId, letterTitle }: { letterId: string; letterTitle: string }) {
  const t = useTranslations("letter.authorRequests");
  const tl = useTranslations("letter");
  const statusText = (s: string) => (tl.has(`physicalStatus.${s}`) ? tl(`physicalStatus.${s}`) : s);
  const { data: session, status } = useSession();
  const token = session?.backendToken;
  const [items, setItems] = useState<Req[] | null>(null);
  const [reject, setReject] = useState<Req | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await apiRequest<{ data: { recipients: Req[] } }>(`/api/letters/${letterId}/recipients`, { token });
      setItems(r.data.recipients);
    } catch {
      setItems([]);
    }
  }, [letterId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (req: Req, action: "approve" | "reject") => {
    if (!token) return;
    setBusy(req.requestId);
    try {
      await apiRequest(`/api/letters/${letterId}/physical-requests/${req.requestId}/approval`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ action, rejectionReason: action === "reject" ? reason.trim() || undefined : undefined }),
      });
      setReject(null);
      setReason("");
      await load();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : t("failed"), { tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  if (status === "loading" || items === null) return null;

  return (
    <div className="relative border border-rule bg-paper p-12 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-9">
      <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
      <h2 className="m-0 border-b-2 border-ink pb-3 font-pen text-[40px] font-normal leading-9 mobile-down:pb-2.5 mobile-down:text-[30px]">{t("heading", { count: items.length })}</h2>
      {items.length === 0 ? (
        <p className="m-0 py-9 text-center font-pen text-2xl text-ink-2">{t("empty")}</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((r) => {
            const d = seoulParts(r.requestedAt);
            const pending = r.status === "requested";
            return (
              <li key={r.requestId} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule py-4 last:border-b-0">
                <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <strong className="font-pen text-[22px] font-normal">{r.name}</strong>
                    <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
                      {t("requestedOn", { date: `${d.mm}.${d.dd}` })}
                    </span>
                    <span className={`badge ${r.status === "rejected" ? "bg-ink-3" : pending ? "bg-brick" : "bg-approve"}`}>{statusText(r.status)}</span>
                  </span>
                  <span className="text-sm text-ink-2">{r.region}</span>
                </div>
                {pending && (
                  <span className="flex gap-2.5">
                    <button type="button" disabled={busy === r.requestId} onClick={() => decide(r, "approve")} className="btn btn-green min-h-11 px-4 text-xl">
                      {t("approve")}
                    </button>
                    <button type="button" disabled={busy === r.requestId} onClick={() => setReject(r)} className="btn btn-ink min-h-11 px-4 text-xl">
                      {t("reject")}
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <V8Dialog open={reject !== null} onOpenChange={(o) => !o && setReject(null)} stamp={t("rejectStamp")} width="max-w-[460px]">
          <V8Title className="m-0 mt-2 font-pen text-[30px] font-normal leading-[1.3] mobile-down:mt-0 mobile-down:text-[28px]">{t("rejectTitle")}</V8Title>
          {reject && (
            <div className="flex flex-col gap-0.5 border border-rule bg-paper px-5 py-4">
              <strong className="font-pen text-[22px] font-normal">
                {reject.name} · {t("requestedOn", { date: `${seoulParts(reject.requestedAt).mm}.${seoulParts(reject.requestedAt).dd}` })}
              </strong>
              <span className="text-[13px] text-ink-2">
                {letterTitle} → {reject.region}
              </span>
            </div>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="font-pen text-xl">
              {t("reason")} <span className="text-base text-ink-3">{t("optional")}</span>
            </span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} className="field min-h-24 resize-y px-3.5 py-3 leading-[1.7]" placeholder={t("reasonPlaceholder")} />
          </label>
          <div className="dlg-actions">
            <V8Close className="btn btn-ink">{t("cancel")}</V8Close>
            <button type="button" disabled={!!busy} onClick={() => reject && decide(reject, "reject")} className="btn btn-brick">
              {busy ? t("processing") : t("reject")}
            </button>
          </div>
      </V8Dialog>
    </div>
  );
}
