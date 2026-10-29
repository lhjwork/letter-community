import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("write.meta");
  return { title: t("drafts") };
}

export default function DraftsLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
