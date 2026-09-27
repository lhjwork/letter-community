"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DOMPurify from "isomorphic-dompurify";
import { DecoLayer } from "@/components/diary/DiaryDeco";
import { getDiary, DIARY_FONTS, type Diary } from "@/lib/diary-api";

const hasText = (html: string) => !!html.replace(/<[^>]*>/g, "").trim();

/**
 * 인쇄용 뷰: 표지 + 쓴 페이지를 A5 한 장씩. 헤더·푸터 없음.
 * 관리자가 Chrome에서 "PDF로 저장"(배경 그래픽 켬) → 인쇄 업체 전달. 사용자 미리보기로도 쓴다.
 */
export default function DiaryPrintPage() {
  const { diaryId } = useParams<{ diaryId: string }>();
  const { data: session, status } = useSession();
  const token = session?.backendToken;
  const [diary, setDiary] = useState<Diary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getDiary(diaryId, token)
      .then((r) => setDiary(r.data))
      .catch(() => setError("다이어리를 불러올 수 없습니다."));
  }, [diaryId, token]);

  if (status === "unauthenticated") return <p className="p-8">로그인이 필요합니다.</p>;
  if (error) return <p className="p-8">{error}</p>;
  if (!diary) return <p className="p-8 text-[#757575]">불러오는 중...</p>;

  const font = DIARY_FONTS.find((f) => f.id === diary.font)?.family ?? "'NanumJangMiCe', cursive";
  const pages = diary.pages.filter((p) => hasText(p.content) || p.decos.length > 0).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="diary-print" style={{ ["--diary-font" as string]: font }}>
      <div className="diary-print__toolbar print:hidden">
        <span>{diary.title} · {pages.length}장</span>
        <button onClick={() => window.print()} className="px-4 py-1.5 rounded-md bg-[#FF9883] text-white">PDF로 저장 / 인쇄</button>
      </div>

      {/* 표지 */}
      <section className="diary-paper diary-print__page diary-print__cover" data-paper={diary.paper === "cream" ? "cream" : "blank"}>
        <h1 style={{ fontFamily: font }}>{diary.title}</h1>
        <p style={{ fontFamily: font }}>{diary.month.replace("-", "년 ")}월</p>
      </section>

      {pages.map((p) => (
        <section key={p.date} className="diary-paper diary-print__page" data-paper={diary.paper}>
          <span className="diary-paper__date">{p.date.replace(/-/g, ". ")}.</span>
          <div className="tiptap" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.content) }} />
          <DecoLayer decos={p.decos} font={font} readOnly />
        </section>
      ))}
    </div>
  );
}
