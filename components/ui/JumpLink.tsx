"use client";

import type { ReactNode } from "react";

/** 같은 페이지 안 이동. 해시를 URL 에 남기지 않아 히스토리 항목이 안 생기고, 뒤로가기가 바로 이전 페이지로 간다 */
export default function JumpLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(to)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
