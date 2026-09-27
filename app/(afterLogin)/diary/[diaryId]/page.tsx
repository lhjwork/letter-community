"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EditorContent } from "@tiptap/react";
import Link from "next/link";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { showAlert } from "@/components/ui/AppAlert";
import { getDiary, saveDiaryPage, updateDiary, DIARY_FONTS, DIARY_PAPERS, type Diary } from "@/lib/diary-api";

const hand = { fontFamily: "NanumJangMiCe, cursive" };
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const AUTOSAVE_MS = 1500;

/** "YYYY-MM"의 마지막 날짜 */
const daysInMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};
const fmtDate = (month: string, day: number) => `${month}-${String(day).padStart(2, "0")}`;

export default function DiaryEditorPage() {
  const { diaryId } = useParams<{ diaryId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.backendToken;

  const [diary, setDiary] = useState<Diary | null>(null);
  const [day, setDay] = useState(1);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pagesRef = useRef<Record<string, string>>({}); // 날짜별 최신 HTML (효과·핸들러에서만 읽음)
  const [writtenDays, setWrittenDays] = useState<Set<string>>(new Set());

  const date = diary ? fmtDate(diary.month, day) : "";
  const lastDay = diary ? daysInMonth(diary.month) : 31;

  // 저장 (디바운스 뒤 호출)
  const flush = useCallback(
    async (d: string, html: string) => {
      if (!token) return;
      setSaveState("saving");
      try {
        await saveDiaryPage(diaryId, d, html, token);
        setSaveState("saved");
      } catch {
        setSaveState("dirty");
        showAlert("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    },
    [diaryId, token],
  );

  const handleChange = useCallback(
    (html: string) => {
      if (!date) return;
      pagesRef.current[date] = html;
      const hasText = !!html.replace(/<[^>]*>/g, "").trim();
      setWrittenDays((prev) => {
        if (prev.has(date) === hasText) return prev;
        const next = new Set(prev);
        if (hasText) next.add(date);
        else next.delete(date);
        return next;
      });
      setSaveState("dirty");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flush(date, html), AUTOSAVE_MS);
    },
    [date, flush],
  );

  const editor = useLetterEditor({ content: "", onChange: handleChange, placeholder: "오늘은 어떤 하루였나요?", enableImages: false });

  // 불러오기: 오늘이 이 달이면 오늘, 아니면 1일.
  // 세션 재조회(창 포커스)로 token이 바뀌어도 다시 불러오지 않는다 — 날짜·내용이 리셋되므로.
  const loadedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!token || loadedRef.current === diaryId) return;
    loadedRef.current = diaryId;
    getDiary(diaryId, token)
      .then((r) => {
        const d = r.data;
        setDiary(d);
        for (const p of d.pages) pagesRef.current[p.date] = p.content;
        setWrittenDays(new Set(d.pages.filter((p) => p.content.replace(/<[^>]*>/g, "").trim()).map((p) => p.date)));
        const today = new Date().toISOString().slice(0, 10);
        setDay(today.startsWith(d.month) ? Number(today.slice(8)) : 1);
      })
      .catch(() => {
        showAlert("다이어리를 찾을 수 없습니다.");
        router.replace("/diary");
      });
  }, [diaryId, token, router]);

  // 날짜가 바뀌면 에디터 내용 교체 (onUpdate 발생 없이)
  useEffect(() => {
    if (!editor || !date) return;
    editor.commands.setContent(pagesRef.current[date] || "", { emitUpdate: false });
  }, [editor, date]);

  // 날짜 이동 전 미저장분 즉시 저장
  const goTo = (next: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (date) flush(date, pagesRef.current[date] ?? "");
    }
    setDay(Math.min(Math.max(next, 1), lastDay));
  };

  const changeSetting = async (patch: Partial<Pick<Diary, "paper" | "font">>) => {
    if (!diary || !token) return;
    setDiary({ ...diary, ...patch });
    try {
      await updateDiary(diaryId, patch, token);
    } catch {
      showAlert("설정을 저장하지 못했습니다.");
    }
  };

  const fontFamily = useMemo(() => DIARY_FONTS.find((f) => f.id === diary?.font)?.family ?? hand.fontFamily, [diary?.font]);

  if (!diary) return <p className="py-12 text-[#757575]">불러오는 중...</p>;

  const weekday = WEEKDAY[new Date(date).getDay()];

  return (
    <div className="py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <Link href="/diary" className="text-[#FF7F65] text-lg" style={hand}>← 나의 다이어리</Link>
        <span className="text-sm text-[#757575]">{saveState === "saving" ? "저장 중..." : saveState === "dirty" ? "저장 대기" : "저장됨"}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontFamily }}>{diary.title}</h1>

      {/* 날짜 이동 */}
      <div className="flex items-center gap-4 mb-4 text-xl" style={hand}>
        <button onClick={() => goTo(day - 1)} disabled={day <= 1} className="px-2 disabled:opacity-30" aria-label="이전 날">◀</button>
        <span>{diary.month.replace("-", "년 ")}월 {day}일 ({weekday})</span>
        <button onClick={() => goTo(day + 1)} disabled={day >= lastDay} className="px-2 disabled:opacity-30" aria-label="다음 날">▶</button>
      </div>

      {/* 날짜 점: 쓴 날은 코랄 */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {Array.from({ length: lastDay }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => goTo(n)}
            aria-label={`${n}일`}
            className={`w-6 h-6 text-[11px] rounded-full border transition-colors ${
              n === day ? "border-[#FF7F65] bg-[#FF7F65] text-white" : writtenDays.has(fmtDate(diary.month, n)) ? "border-[#FF9883] text-[#FF7F65]" : "border-[#E5E5E5] text-[#9E9E9E]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* 종이·글씨체 */}
      <div className="flex flex-wrap gap-5 mb-4 text-sm text-[#424242]">
        <div className="flex items-center gap-2">
          <span className="text-[#757575]">종이</span>
          {DIARY_PAPERS.map((p) => (
            <button key={p.id} onClick={() => changeSetting({ paper: p.id })} className={`px-3 py-1 rounded-full border ${diary.paper === p.id ? "border-[#FF9883] text-[#FF7F65]" : "border-[#C4C4C4]"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#757575]">글씨체</span>
          {DIARY_FONTS.map((f) => (
            <button key={f.id} onClick={() => changeSetting({ font: f.id })} className={`px-3 py-1 rounded-full border text-base ${diary.font === f.id ? "border-[#FF9883] text-[#FF7F65]" : "border-[#C4C4C4]"}`} style={{ fontFamily: f.family }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* A5 종이 */}
      <div className="diary-paper mx-auto w-full max-w-[640px]" data-paper={diary.paper} style={{ ["--diary-font" as string]: fontFamily }}>
        <span className="diary-paper__date">{date.replace(/-/g, ". ")}.</span>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
