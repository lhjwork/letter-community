"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";
import LoginDialog from "./LoginDialog";

type Props = { href: string; className?: string; children: ReactNode };

/** 보호 라우트로 가는 링크. 로그인 전이면 같은 자리에서 로그인 모달을 열고, 로그인 후 href 로 보낸다 */
export default function AuthLink({ href, className, children }: Props) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "authenticated") {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <LoginDialog isOpen={open} onClose={() => setOpen(false)} callbackUrl={href} />
    </>
  );
}
