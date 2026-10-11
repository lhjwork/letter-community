"use client";

import { updateUser } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NAME_CHANGE_MS, md, ymd } from "./date";

/** 닉네임 변경 (30일 1회, 서버도 같은 제한). 결과는 버튼 문구로, 오류·잠김은 안내 줄에. unlockAt: 잠겨 있으면 다시 바꿀 수 있는 시각 */
export default function NicknameForm({ name, nameUpdatedAt, unlockAt: unlockAtLoad }: { name: string; nameUpdatedAt?: string; unlockAt?: string }) {
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
    if (!next) return setError("닉네임을 적어 주세요.");
    if (next === name) return setError("지금 닉네임과 같아요.");
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
      setError(err instanceof Error ? err.message : "닉네임을 바꾸지 못했어요.");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-[1_1_420px] flex-col gap-2.5 mobile-down:flex-auto mobile-down:gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="font-pen text-xl">닉네임</span>
        <span className="flex gap-2">
          <input
            type="text"
            name="name"
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
            {state === "saving" ? "저장 중" : state === "saved" ? "저장됨" : "저장"}
          </button>
        </span>
      </label>
      <p role="status" className={`m-0 text-[13px] leading-[1.7] mobile-down:text-xs ${error ? "text-brick" : "text-ink-3"}`}>
        {error || (unlockAt ? `${md(unlockAt)}부터 바꿀 수 있어요.` : (
          <>
            <span className="mobile-down:hidden">닉네임은 </span>한 달에 한 번만 바꿀 수 있어요.
            {nameUpdatedAt && <span className="mobile-down:hidden"> 마지막 변경 {ymd(nameUpdatedAt)}</span>}
          </>
        ))}
      </p>
    </form>
  );
}
