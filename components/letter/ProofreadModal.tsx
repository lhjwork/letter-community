"use client";

import { useState } from "react";
import Image from "next/image";
import type { Correction } from "@/lib/ai/proofread-types";

export type { Correction };
export { applyCorrections } from "@/lib/ai/proofread-utils";

/** 등록 직전 맞춤법 점검 요청. 어떤 실패든 빈 배열로 돌려 등록을 막지 않는다. */
export async function requestProofread(content: string): Promise<Correction[]> {
  try {
    const res = await fetch("/api/ai/proofread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.corrections) ? data.corrections : [];
  } catch {
    return [];
  }
}

interface Props {
  open: boolean;
  corrections: Correction[];
  /** 선택한 교정만 적용해서 등록 */
  onConfirm: (selected: Correction[]) => void;
  /** 원문 그대로 등록 */
  onSkip: () => void;
  onClose: () => void;
}

export default function ProofreadModal({ open, corrections, onConfirm, onSkip, onClose }: Props) {
  const [unchecked, setUnchecked] = useState<Set<number>>(new Set());
  if (!open) return null;

  const toggle = (i: number) =>
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const selected = corrections.filter((_, i) => !unchecked.has(i));

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[#F0E0DC] bg-white p-6 sm:p-8 text-[#424242]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <Image src="/icons/letter-heart-icon.svg" alt="" width={30} height={27} className="mx-auto mb-3 h-11 w-12" />
          <h3 className="text-2xl font-['NanumJangMiCe']">맞춤법을 살펴봤어요</h3>
          <p className="mt-1 text-sm text-[#757575]">고칠 곳만 골라주세요. 말투와 내용은 바꾸지 않았어요.</p>
        </div>

        <ul className="space-y-3">
          {corrections.map((c, i) => (
            <li key={i}>
              <label className="flex items-start gap-3 rounded-lg border border-[#F0E0DC] bg-[#FFF7F5] p-3 cursor-pointer">
                <input type="checkbox" checked={!unchecked.has(i)} onChange={() => toggle(i)} className="mt-1 accent-[#FF7F65]" />
                <span className="flex-1 min-w-0">
                  <span className="block break-words">
                    <span className="line-through text-[#B0B0B0]">{c.original}</span>
                    <span className="mx-2 text-[#B0B0B0]">→</span>
                    <span className="font-semibold text-[#FF7F65]">{c.corrected}</span>
                  </span>
                  {c.reason && <span className="block text-xs text-[#757575] mt-1">{c.reason}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="h-12 rounded-lg border-2 border-gray-400 bg-white text-[#757575] text-base font-medium hover:bg-gray-50"
          >
            그대로 등록
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            className="h-12 rounded-lg bg-[#FF9883] text-white text-base font-medium hover:bg-[#FF7F65] transition-colors"
          >
            {selected.length ? `${selected.length}곳 고쳐서 등록` : "그대로 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
