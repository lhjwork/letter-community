"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/ui/AppAlert";
import LoginDialog from "@/components/shareds/LoginDialog";
import { useLike } from "@/hooks/useLike";

/** "이 사연에 답장 쓰기" → #reply. 비로그인은 로그인 모달(로그인 후 폼으로) */
export function ReplyCta({ storyId, className }: { storyId: string; className: string }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const href = `/letter/${storyId}#reply`;
  if (status === "authenticated") {
    return (
      <a href="#reply" className={className}>
        이 사연에 답장 쓰기
      </a>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        이 사연에 답장 쓰기
      </button>
      <LoginDialog isOpen={open} onClose={() => setOpen(false)} callbackUrl={href} />
    </>
  );
}

/** 마음에 담기 = 기존 like 토글. 숫자는 보여주지 않는다 */
export function SaveButton({ letterId }: { letterId: string }) {
  const { isLiked, isToggling, toggleLike, isLoggedIn } = useLike({ letterId, letterType: "story" });
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-pressed={isLiked}
        disabled={isToggling}
        onClick={() => (isLoggedIn ? toggleLike() : setOpen(true))}
        className="btn btn-ink mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl"
      >
        <span aria-hidden="true" className={`mr-2 mobile-down:mr-1.5 ${isLiked ? "text-brick" : ""}`}>
          {isLiked ? "♥" : "♡"}
        </span>
        {isLiked ? "마음에 담았어요" : "마음에 담기"}
      </button>
      <LoginDialog isOpen={open} onClose={() => setOpen(false)} callbackUrl={`/letter/${letterId}`} />
    </>
  );
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showAlert("링크를 복사하지 못했어요. 주소창의 주소를 복사해 주세요.");
    }
  };
  return (
    <button type="button" onClick={copy} aria-live="polite" className="btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-xl">
      {copied ? "복사했어요" : "링크 복사"}
    </button>
  );
}
