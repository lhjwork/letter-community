"use client";

import { useEffect, useState } from "react";

// 알림 토스트 (v8-Modals-1 "알림 · 토스트"). showAlert()는 어디서든 호출하고, <AlertHost />는 루트 레이아웃에 한 번만 둔다.
// 화면 아래 중앙, 3초 뒤 사라짐, 여러 개면 위로 쌓인다. 루트 레이아웃에 있어 페이지 이동 후에도 남는다.
type Tone = "info" | "success" | "error";
type Toast = { id: number; text: string; tone: Tone };

let listener: ((t: Toast) => void) | null = null;
let seq = 0;

export function showAlert(message: unknown, opts?: { tone?: "success" | "error" }) {
  const text = message instanceof Error ? message.message : String(message);
  if (listener) listener({ id: ++seq, text, tone: opts?.tone ?? "info" });
  else if (typeof window !== "undefined") window.alert(text); // 호스트 미마운트 시 폴백
}

const BAND: Record<Tone, string> = { info: "airmail", success: "bg-approve", error: "bg-brick" };
const TILT = ["-rotate-[0.6deg]", "rotate-[0.5deg]", "-rotate-[0.4deg]"];

export function AlertHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listener = (t) => {
      setToasts((ts) => [...ts, t]);
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 3000);
    };
    return () => {
      listener = null;
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 mobile-down:bottom-auto mobile-down:top-20 z-[100] flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 flex-col items-center gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={`relative flex min-h-[52px] items-center border border-rule bg-paper py-2 pl-6 pr-5 shadow-[0_10px_0_-4px_#e3dacb] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 ${TILT[t.id % 3]}`}
        >
          <span className={`absolute inset-y-0 left-0 w-1.5 ${BAND[t.tone]}`} aria-hidden="true" />
          <span className={`whitespace-pre-line font-pen text-[22px] leading-[1.3] ${t.tone === "error" ? "text-brick" : "text-ink"}`}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
