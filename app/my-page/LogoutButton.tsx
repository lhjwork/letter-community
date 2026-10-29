"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LogoutButton({ className }: { className: string }) {
  const t = useTranslations("myPage");
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className={className}>
      {t("logout")}
    </button>
  );
}
