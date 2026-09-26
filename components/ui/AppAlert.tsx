"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// 브라우저 기본 alert() 대체. showAlert()는 어디서든 호출하고, <AlertHost />는 루트 레이아웃에 한 번만 둔다.
// 기본 alert과 달리 코드 실행을 막지 않는다(비동기). 루트 레이아웃에 있어 페이지 이동 후에도 남는다.
let listener: ((message: string) => void) | null = null;

export function showAlert(message: unknown) {
  const text = message instanceof Error ? message.message : String(message);
  if (listener) listener(text);
  else if (typeof window !== "undefined") window.alert(text); // 호스트 미마운트 시 폴백
}

export function AlertHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    listener = setMessage;
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") setMessage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMessage(null)}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-describedby="app-alert-message"
            className="w-full max-w-sm rounded-2xl border-2 border-[#F0E0DC] bg-white p-6 sm:p-8 text-center text-[#424242]"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src="/icons/letter-heart-icon.svg" alt="" width={30} height={27} className="mx-auto mb-4 h-11 w-12" />
            <p id="app-alert-message" className="whitespace-pre-line text-lg leading-relaxed font-['NanumJangMiCe']">
              {message}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setMessage(null)}
              className="mt-6 h-12 min-w-[120px] rounded-lg bg-[#FF9883] px-6 text-lg font-medium text-white transition-colors hover:bg-[#FF7F65] font-['NanumJangMiCe']"
            >
              확인
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
