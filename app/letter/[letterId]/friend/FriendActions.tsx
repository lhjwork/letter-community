"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics/ga";
import { deleteLetter } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CopyLinkButton } from "../story/StoryActions";
import JumpLink from "@/components/ui/JumpLink";
import AuthLink from "@/components/shareds/AuthLink";

const ROW = "mt-10 flex w-full max-w-[760px] flex-wrap justify-center gap-3 mobile-down:mt-8 mobile-down:flex-col mobile-down:gap-2.5";
const SUB = "btn btn-ink mobile-down:flex-1 mobile-down:px-3 mobile-down:text-[22px]";

function useViewTrack(letterId: string, isAuthor: boolean) {
  useEffect(() => {
    track("letter_view", { letter_type: "friend", letter_id: letterId, is_author: isAuthor });
  }, [letterId, isAuthor]);
}

/** 수신자·비로그인: 종이로 받기(#request) · 링크 복사 · 나도 편지 쓰기 */
export function ReaderActions({ letterId, canRequest }: { letterId: string; canRequest: boolean }) {
  useViewTrack(letterId, false);
  const t = useTranslations("letter.friendActions");
  return (
    <div className={ROW}>
      {canRequest && (
        <JumpLink to="request" className="btn btn-brick min-h-14 px-8 text-[28px]">
          {t("requestPaper")}
        </JumpLink>
      )}
      <div className="contents mobile-down:flex mobile-down:gap-2.5">
        <CopyLinkButton className={SUB} />
        <AuthLink href="/write" className="btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-[22px]">
          <span>{t.rich("writeToo", { wide: (c) => <span className="mobile-down:hidden">{c}</span> })}</span>
        </AuthLink>
      </div>
    </div>
  );
}

/** 작성자: 링크 복사 · 수정 · 삭제(ConfirmDialog) */
export function AuthorActions({ letterId }: { letterId: string }) {
  useViewTrack(letterId, true);
  const t = useTranslations("letter.friendActions");
  const router = useRouter();
  const { data: session } = useSession();
  const [confirm, setConfirm] = useState(false);

  const remove = async () => {
    if (!session?.backendToken) return showAlert(t("loginRequired"), { tone: "error" });
    await deleteLetter(letterId, session.backendToken);
    track("letter_delete", { letter_type: "friend", letter_id: letterId });
    router.push("/letter-box");
  };

  return (
    <div className={ROW}>
      <CopyLinkButton className="btn btn-brick min-h-14 px-8 text-[28px]" />
      <div className="contents mobile-down:flex mobile-down:gap-2.5">
        <Link href={`/write?kind=friend&id=${letterId}`} className="btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-[22px]">
          {t("edit")}
        </Link>
        <button type="button" onClick={() => setConfirm(true)} className={SUB}>
          {t("delete")}
        </button>
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={t("deleteTitle")} description={t("deleteDescription")} confirmText={t("deleteConfirm")} variant="destructive" onConfirm={remove} />
    </div>
  );
}
