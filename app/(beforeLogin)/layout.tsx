import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
