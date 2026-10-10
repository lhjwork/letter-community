"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showAlert } from "@/components/ui/AppAlert";
import { createDiary, getMyDiaries, DIARY_FONTS, DIARY_PAPERS, type Diary, type DiaryFont, type DiaryPaper } from "@/lib/diary-api";

const hand = { fontFamily: "NanumJangMiCe, cursive" };
const thisMonth = new Date().toISOString().slice(0, 7);

export default function DiaryListPage() {
  const { data: session } = useSession();
  const token = session?.backendToken;
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(thisMonth);
  const [paper, setPaper] = useState<DiaryPaper>("lined");
  const [font, setFont] = useState<DiaryFont>("jangmi");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMyDiaries(token)
      .then((r) => setDiaries(r.data))
      .catch(() => showAlert("다이어리를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async () => {
    if (!token || !title.trim()) return;
    setCreating(true);
    try {
      const r = await createDiary({ title: title.trim(), month, paper, font }, token);
      setDiaries((d) => [r.data, ...d]);
      setTitle("");
    } catch (e) {
      showAlert(e instanceof Error ? e.message : "다이어리를 만들지 못했습니다.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl mb-8" style={hand}>나의 다이어리</h1>

      {/* 새 다이어리 */}
      <section className="rounded-lg border border-[#C4C4C4] bg-white p-5 sm:p-7 mb-10">
        <h2 className="text-2xl mb-4" style={hand}>새 다이어리 만들기</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            placeholder="다이어리 이름 (예: 9월의 기록)"
            className="flex-1 border border-[#C4C4C4] rounded-md px-4 py-2 text-lg focus:outline-none focus:border-[#FF9883]"
            style={hand}
          />
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-[#C4C4C4] rounded-md px-4 py-2" />
        </div>
        <div className="flex flex-wrap gap-6 mb-5 text-sm text-[#424242]">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">종이</legend>
            <span className="text-[#757575]">종이</span>
            {DIARY_PAPERS.map((p) => (
              <label key={p.id} className={`cursor-pointer px-3 py-1 rounded-full border ${paper === p.id ? "border-[#FF9883] text-[#FF7F65]" : "border-[#C4C4C4]"}`}>
                <input type="radio" name="paper" className="sr-only" checked={paper === p.id} onChange={() => setPaper(p.id)} />
                {p.label}
              </label>
            ))}
          </fieldset>
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">글씨체</legend>
            <span className="text-[#757575]">글씨체</span>
            {DIARY_FONTS.map((f) => (
              <label key={f.id} className={`cursor-pointer px-3 py-1 rounded-full border text-base ${font === f.id ? "border-[#FF9883] text-[#FF7F65]" : "border-[#C4C4C4]"}`} style={{ fontFamily: f.family }}>
                <input type="radio" name="font" className="sr-only" checked={font === f.id} onChange={() => setFont(f.id)} />
                {f.label}
              </label>
            ))}
          </fieldset>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating || !title.trim() || !token}
          className="px-6 py-2 rounded-lg bg-[#FF9883] text-white hover:bg-[#ff8a70] disabled:opacity-50 transition-colors"
        >
          {creating ? "만드는 중..." : "만들기"}
        </button>
      </section>

      {/* 목록 */}
      {loading ? (
        <p className="text-[#757575]">불러오는 중...</p>
      ) : diaries.length === 0 ? (
        <p className="text-[#757575]" style={hand}>아직 다이어리가 없어요. 위에서 첫 권을 만들어보세요.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {diaries.map((d) => (
            <li key={d._id}>
              <Link href={`/diary/${d._id}`} className="block rounded-lg border border-[#C4C4C4] bg-white p-5 hover:border-[#FF9883] transition-colors">
                <p className="text-2xl mb-1" style={{ fontFamily: DIARY_FONTS.find((f) => f.id === d.font)?.family }}>{d.title}</p>
                <p className="text-sm text-[#757575]">
                  {d.month.replace("-", "년 ")}월 · {d.pages.length}장 씀
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
