"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { track } from "@/lib/analytics/ga";
import { deleteLetter } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CopyLinkButton } from "../story/StoryActions";
import JumpLink from "@/components/ui/JumpLink";

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
  return (
    <div className={ROW}>
      {canRequest && (
        <JumpLink to="request" className="btn btn-brick min-h-14 px-8 text-[28px]">
          이 편지, 종이로 받기
        </JumpLink>
      )}
      <div className="contents mobile-down:flex mobile-down:gap-2.5">
        <CopyLinkButton className={SUB} />
        <Link href="/write" className="btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-[22px]">
          <span>
            나도 <span className="mobile-down:hidden">편지 </span>쓰기
          </span>
        </Link>
      </div>
    </div>
  );
}

/** 작성자: 링크 복사 · 수정 · 삭제(ConfirmDialog) */
export function AuthorActions({ letterId }: { letterId: string }) {
  useViewTrack(letterId, true);
  const router = useRouter();
  const { data: session } = useSession();
  const [confirm, setConfirm] = useState(false);

  const remove = async () => {
    if (!session?.backendToken) return showAlert("로그인이 필요해요.", { tone: "error" });
    await deleteLetter(letterId, session.backendToken);
    track("letter_delete", { letter_type: "friend", letter_id: letterId });
    router.push("/letter-box");
  };

  return (
    <div className={ROW}>
      <CopyLinkButton className="btn btn-brick min-h-14 px-8 text-[28px]" />
      <div className="contents mobile-down:flex mobile-down:gap-2.5">
        <Link href={`/write?kind=friend&id=${letterId}`} className="btn btn-blue mobile-down:flex-1 mobile-down:px-3 mobile-down:text-[22px]">
          수정하기
        </Link>
        <button type="button" onClick={() => setConfirm(true)} className={SUB}>
          삭제하기
        </button>
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="편지를 삭제할까요?" description="삭제한 편지는 되돌릴 수 없고, 링크로도 열리지 않아요." confirmText="삭제" variant="destructive" onConfirm={remove} />
    </div>
  );
}
