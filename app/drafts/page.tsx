"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getDrafts, deleteDraft } from "@/lib/draft-api";
import type { DraftLetter } from "@/types/draft";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";

/** 10.11 · 14:02 (서울). 임시저장은 저장 시각으로 구분한다 */
function fmt(iso: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]),
  );
  return `${p.month}.${p.day} · ${p.hour}:${p.minute}`;
}

/** 임시저장 목록. 우편함 보드 작업 때 그쪽으로 옮길 수 있음 */
export default function DraftsPage() {
  const t = useTranslations("write.drafts");
  const { data: session } = useSession();
  const token = session?.backendToken;
  const [drafts, setDrafts] = useState<DraftLetter[] | null>(null);
  const [removing, setRemoving] = useState<DraftLetter | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getDrafts(token, { limit: 50 })
      .then((res) => setDrafts(res.data.drafts))
      .catch((e) => {
        console.error("임시저장 목록 실패:", e);
        setError(t("loadError"));
        setDrafts([]);
      });
  }, [token, t]);

  // 성공하면 목록에서 행이 사라지는 것으로 충분하다. 실패만 한 줄로 알린다
  const remove = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await deleteDraft(token, id);
      setDrafts((list) => list?.filter((d) => d._id !== id) ?? null);
    } catch (e) {
      console.error("임시저장 삭제 실패:", e);
      setError(t("deleteError"));
    }
  };

  return (
    <main>
      <section className={`${WRAP} pt-3 mobile-down:pt-1`}>
        <Link href="/letter-box" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          {t("back")}
        </Link>
      </section>
      <section className={`${WRAP} flex flex-col gap-3 pb-10 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
        <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{t("eyebrow")}</p>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{t("title")}</h1>
      </section>
      <section className={`${WRAP} pb-24`}>
        {error && (
          <p role="alert" className="m-0 mb-4 text-[15px] text-brick">
            {error}
          </p>
        )}
        {drafts === null ? (
          <p className="m-0 font-pen text-xl text-ink-3">{t("loading")}</p>
        ) : drafts.length === 0 ? (
          <p className="m-0 font-pen text-2xl text-ink-2">{t("empty")}</p>
        ) : (
          <ul className="m-0 list-none border-t-2 border-ink p-0">
            {drafts.map((d) => (
              <li key={d._id} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-rule py-4">
                <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-1">
                  <span className="truncate font-pen text-2xl text-ink">{d.title || d.autoTitle || t("untitled")}</span>
                  <span className="text-sm text-ink-2">
                    {d.type === "story" ? t("story") : t("friend")}
                    {d.recipientName ? ` · To. ${d.recipientName}` : ""}
                    {" · "}
                    <span className="font-anton text-xs tracking-[0.1em] text-ink-3">{fmt(d.lastSavedAt)}</span>
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <Link href={`/write?draftId=${d._id}`} className="btn btn-blue min-h-11 px-5 text-xl">
                    {t("continue")}
                  </Link>
                  <button type="button" onClick={() => setRemoving(d)} className="btn min-h-11 border-rule px-3.5 text-lg text-ink-3">
                    {t("delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("confirmTitle")}
        description={removing ? t("confirmDesc", { title: removing.title || removing.autoTitle || t("untitled") }) : ""}
        confirmText={t("delete")}
        variant="destructive"
        onConfirm={() => removing && remove(removing._id)}
      />
    </main>
  );
}
