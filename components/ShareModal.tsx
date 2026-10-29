"use client";

import { track } from "@/lib/analytics/ga";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("shared.share");
  const copy = async () => {
    track("share", { method: "copy_link", content_type: "friend" });
    try {
      await navigator.clipboard.writeText(letterUrl);
      showAlert(t("copied"));
    } catch {
      showAlert(t("copyFailed"), { tone: "error" });
    }
  };

  return (
    <V8Dialog open={isOpen} onOpenChange={(o) => !o && onClose()} stamp={t("stamp")} stampTone="text-airblue" described>
      <div className="mt-2 flex flex-col items-center gap-2.5 text-center mobile-down:mt-0">
        <Image src="/v8/envelope-small.png" alt="" width={72} height={64} className="h-16 w-[72px] object-contain" />
        <V8Title className="m-0 font-pen text-[34px] font-normal leading-[1.25] mobile-down:text-[30px]">{t("title")}</V8Title>
        <V8Description className="m-0 text-sm leading-[1.8] text-ink-2">
          {t("desc1")}
          <br />
          {t("desc2")}
        </V8Description>
      </div>
      <div className="paper ruled -rotate-[0.6deg] px-6 py-9 shadow-[0_6px_0_-3px_#e3dacb]">
        {recipientName && <span className="block font-pen text-lg leading-9 text-brick">To. {recipientName}</span>}
        <strong className="block font-pen text-2xl font-normal leading-9">{letterTitle}</strong>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-pen text-xl">{t("link")}</span>
        <span className="flex gap-2">
          <input type="text" readOnly value={letterUrl} onFocus={(e) => e.currentTarget.select()} className="field min-w-0 flex-1 text-ink-2" />
          <button type="button" onClick={copy} className="btn btn-ink whitespace-nowrap text-xl">
            {t("copy")}
          </button>
        </span>
      </label>
      <a href={letterUrl} className="btn btn-brick text-xl">
        {t("read")}
      </a>
    </V8Dialog>
  );
}
