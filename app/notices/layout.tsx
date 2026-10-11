import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";

export default function NoticesLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
