"use client";

import { updateUser } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { NAME_CHANGE_MS, md, ymd } from "./date";

/** 닉네임 변경 (30일 1회, 서버도 같은 제한). 결과는 버튼 문구로, 오류·잠김은 안내 줄에. unlockAt: 잠겨 있으면 다시 바꿀 수 있는 시각 */
export default function NicknameForm({ name, nameUpdatedAt, unlockAt: unlockAtLoad }: { name: string; nameUpdatedAt?: string; unlockAt?: string }) {
  const t = useTranslations("myPage.nickname");
  const locale = useLocale();
  const { data: session, update } = useSession();
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [unlockAt, setUnlockAt] = useState(unlockAtLoad);
  const locked = !!unlockAt;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = value.trim();
    if (!session?.backendToken || state === "saving") return;
    if (!next) return setError(t("required"));
    if (next === name) return setError(t("same"));
    setState("saving");
    setError("");
    try {
      await updateUser(session.backendToken, { name: next });
      await update({ name: next });
      setUnlockAt(new Date(Date.now() + NAME_CHANGE_MS).toISOString());
      setState("saved");
      router.refresh();
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : t("failed"));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-[1_1_420px] flex-col gap-2.5 mobile-down:flex-auto mobile-down:gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="font-pen text-xl">{t("label")}</span>
        <span className="flex gap-2">
          <input
            type="text"
            name="name"
            aria-label={t("label")}
            className="field min-w-0 flex-1 disabled:cursor-not-allowed disabled:text-ink-3"
            value={value}
            maxLength={20}
            disabled={locked}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />
          <button type="submit" disabled={locked || state === "saving"} className={`btn btn-brick min-h-12 shrink-0 text-xl disabled:cursor-not-allowed ${state === "saved" ? "" : "disabled:opacity-60"}`}>
            {state === "saving" ? t("saving") : state === "saved" ? t("saved") : t("save")}
          </button>
        </span>
      </label>
      <p role="status" className={`m-0 text-[13px] leading-[1.7] mobile-down:text-xs ${error ? "text-brick" : "text-ink-3"}`}>
        {error || (unlockAt ? t("unlockAt", { date: md(unlockAt, locale) }) : (
          <>
            <span className="mobile-down:hidden">{t("rulePrefix")}</span>{t("rule")}
            {nameUpdatedAt && <span className="mobile-down:hidden">{t("lastChanged", { date: ymd(nameUpdatedAt, locale) })}</span>}
          </>
        ))}
      </p>
    </form>
  );
}
