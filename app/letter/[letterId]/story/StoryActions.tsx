"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { showAlert } from "@/components/ui/AppAlert";
import LoginDialog from "@/components/shareds/LoginDialog";
import JumpLink from "@/components/ui/JumpLink";
import { useLike } from "@/hooks/useLike";

/** "이 사연에 답장 쓰기" → #reply. 비로그인은 로그인 모달(로그인 후 폼으로) */
export function ReplyCta({ storyId, className }: { storyId: string; className: string }) {
  const t = useTranslations("letter.actions");
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const href = `/letter/${storyId}#reply`;
  if (status === "authenticated") {
    return (
      <JumpLink to="reply" className={className}>
        {t("replyCta")}
      </JumpLink>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {t("replyCta")}
      </button>
      <LoginDialog isOpen={open} onClose={() => setOpen(false)} callbackUrl={href} />
    </>
  );
}

/** 마음에 담기 = 기존 like 토글. 숫자는 보여주지 않는다. 아이콘은 레터 손그림 하트(담으면 진하게) */
export function SaveButton({ letterId, className = "btn btn-ink mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl" }: { letterId: string; className?: string }) {
  const t = useTranslations("letter.actions");
  const { isLiked, isToggling, toggleLike, isLoggedIn } = useLike({ letterId, letterType: "story" });
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-pressed={isLiked}
        disabled={isToggling}
        onClick={() => (isLoggedIn ? toggleLike() : setOpen(true))}
        className={className}
      >
        <Image src="/icons/letter-heart-icon.svg" alt="" width={30} height={27} aria-hidden="true" className={`mr-2 h-[22px] w-auto transition-[opacity,transform] mobile-down:mr-1.5 ${isLiked ? "scale-110" : "opacity-55"}`} />
        {isLiked ? t("saved") : t("save")}
      </button>
      <LoginDialog isOpen={open} onClose={() => setOpen(false)} callbackUrl={`/letter/${letterId}`} />
    </>
  );
}

export function CopyLinkButton({ className = "btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl" }: { className?: string }) {
  const t = useTranslations("letter.actions");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
      showAlert(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showAlert(t("copyFailed"), { tone: "error" });
    }
  };
  return (
    <button type="button" onClick={copy} aria-live="polite" className={className}>
      {copied ? t("copiedShort") : t("copyLink")}
    </button>
  );
}
