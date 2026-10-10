import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";

export default function AfterLoginLayout({ children }: { children: ReactNode }) {
  return <SiteShell narrow>{children}</SiteShell>;
}
