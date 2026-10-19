import type { ReactNode } from "react";

/** 쓰기 화면과 같은 편지지 그림 위에 To. / 본문 / From. 이 줄마다 앉는다. 자식은 leading-(--line) 단위로 쌓고 From. 에 mt-auto */
export default function LetterSheet({ className = "", label, children }: { className?: string; label?: string; children: ReactNode }) {
  return (
    <div className={`@container w-full max-w-[720px] ${className}`}>
      <article className="letter-sheet" aria-label={label}>
        {children}
      </article>
    </div>
  );
}
