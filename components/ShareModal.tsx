"use client";

import { track } from "@/lib/analytics/ga";
import Image from "next/image";
import V8Dialog, { V8Description, V8Title } from "@/components/ui/V8Dialog";
import { showAlert } from "@/components/ui/AppAlert";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterUrl: string;
  letterTitle: string;
  recipientName?: string;
}

/** 마음 편지 완성 후 공유 (v8-Modals-1 ShareModal) */
export default function ShareModal({ isOpen, onClose, letterUrl, letterTitle, recipientName }: ShareModalProps) {
  const copy = async () => {
    track("share", { method: "copy_link", content_type: "friend" });
    try {
      await navigator.clipboard.writeText(letterUrl);
      showAlert("링크를 복사했어요");
    } catch {
      showAlert("링크를 복사하지 못했어요. 링크 칸을 길게 눌러 복사해 주세요.", { tone: "error" });
    }
  };

  return (
    <V8Dialog open={isOpen} onOpenChange={(o) => !o && onClose()} stamp="편지 완성" stampTone="text-airblue" described>
      <div className="mt-2 flex flex-col items-center gap-2.5 text-center mobile-down:mt-0">
        <Image src="/v8/envelope-small.png" alt="" width={72} height={64} className="h-16 w-[72px] object-contain" />
        <V8Title className="m-0 font-pen text-[34px] font-normal leading-[1.25] mobile-down:text-[30px]">편지가 봉투에 담겼어요</V8Title>
        <V8Description className="m-0 text-sm leading-[1.8] text-ink-2">
          링크를 보내면 받는 사람 화면에
          <br />
          봉투처럼 도착해요.
        </V8Description>
      </div>
      <div className="paper ruled -rotate-[0.6deg] px-6 py-9 shadow-[0_6px_0_-3px_#e3dacb]">
        {recipientName && <span className="block font-pen text-lg leading-9 text-brick">To. {recipientName}</span>}
        <strong className="block font-pen text-2xl font-normal leading-9">{letterTitle}</strong>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-pen text-xl">공유 링크</span>
        <span className="flex gap-2">
          <input type="text" readOnly value={letterUrl} onFocus={(e) => e.currentTarget.select()} className="field min-w-0 flex-1 text-ink-2" />
          <button type="button" onClick={copy} className="btn btn-ink whitespace-nowrap text-xl">
            링크 복사
          </button>
        </span>
      </label>
      <a href={letterUrl} className="btn btn-brick text-xl">
        편지 읽기
      </a>
    </V8Dialog>
  );
}
