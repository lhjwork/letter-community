import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";

/** /write 는 v8 전폭. (afterLogin) 의 narrow 셸 대신 여기서 전폭 셸을 쓴다 */
export default function WriteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
