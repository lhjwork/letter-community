import { ReactNode } from "react";
import { NARROW } from "../narrow";

/** 아직 v8 로 안 옮긴 실물 편지 신청 화면의 기존 폭 */
export default function RequestLayout({ children }: { children: ReactNode }) {
  return <div className={NARROW}>{children}</div>;
}
