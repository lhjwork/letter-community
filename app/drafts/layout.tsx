import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "임시저장" };

export default function DraftsLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
