import SiteShell from "@/components/shareds/SiteShell";
import { ReactNode } from "react";

/** 항공우편 띠 + 헤더/푸터. 사연 상세는 1180 폭(v8), 마음 편지·실물 신청은 각 페이지가 기존 폭을 감싼다 */
export default function LetterLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
