"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getMyLetters, type Letter } from "@/lib/api";
import { DiaryDeco, MAX_DECOS, STICKERS, STICKER_COLORS, TAPES, newDecoId, randomPlacement } from "@/lib/diary-decos";

/* ───────────── 데코 한 개 그리기 (편집·인쇄 공용) ───────────── */

function DecoView({ deco, font }: { deco: DiaryDeco; font: string }) {
  if (deco.type === "sticker") {
    const s = STICKERS[deco.src];
    if (!s) return null;
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full" style={{ color: deco.color ?? STICKER_COLORS[0] }} aria-hidden="true">
        <path d={s.path} fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (deco.type === "tape") {
    const t = TAPES[deco.src];
    if (!t) return null;
    return (
      <div
        className="w-full h-full opacity-90"
        style={{ backgroundColor: t.bg, backgroundImage: t.pattern, backgroundSize: t.pattern?.startsWith("radial") ? "8px 8px" : t.pattern?.startsWith("linear") ? "8px 8px" : undefined, clipPath: "polygon(1% 0,99% 3%,100% 100%,0 97%)" }}
      />
    );
  }
  if (deco.type === "letter") {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-[3px] border-2 border-[#FF9883] bg-[#FFFDFB] flex items-end justify-center" style={{ fontFamily: font }}>
        {/* 봉투 덮개 */}
        <div className="absolute inset-x-0 top-0 h-[42%] bg-[#FF9883] opacity-90" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        <span className="relative px-2 pb-[6%] text-[0.9em] leading-tight text-center text-[#2B3446] line-clamp-2">{deco.text || "편지"}</span>
      </div>
    );
  }
  return (
    <div className="w-full px-2 py-0.5 leading-snug text-center whitespace-pre-wrap break-keep" style={{ fontFamily: font, backgroundColor: deco.color ?? "#F9C9C0", color: "#2B3446", fontSize: "1em" }}>
      {deco.text || "라벨"}
    </div>
  );
}

/** 폭(%)에 대한 높이 비율. 스티커 1:1, 마테 1:0.22, 라벨은 내용 높이 */
const aspect = (d: DiaryDeco) => (d.type === "sticker" ? 1 : d.type === "tape" ? 0.22 : d.type === "letter" ? 0.66 : undefined);

/* ───────────── 종이 위 레이어 ───────────── */

interface LayerProps {
  decos: DiaryDeco[];
  font: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (decos: DiaryDeco[]) => void;
  readOnly?: boolean;
}

/** `.diary-paper` 안에 absolute로 깔린다. 좌표는 종이 폭 % → px 환산 */
export function DecoLayer({ decos, font, selectedId, onSelect, onChange, readOnly }: LayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pw, setPw] = useState(0);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const px = (v: number) => (v / 100) * pw;

  const onDown = (e: ReactPointerEvent, d: DiaryDeco) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect?.(d.id);
    drag.current = { id: d.id, sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    const g = drag.current;
    if (!g || !pw) return;
    const nx = g.ox + ((e.clientX - g.sx) / pw) * 100;
    const ny = g.oy + ((e.clientY - g.sy) / pw) * 100;
    onChange?.(decos.map((d) => (d.id === g.id ? { ...d, x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10 } : d)));
  };
  const onUp = () => {
    drag.current = null;
  };

  const sorted = [...decos].sort((a, b) => a.z - b.z);
  const fontPx = pw ? Math.max(12, pw * 0.032) : 16;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" style={{ fontSize: fontPx }}>
      {pw > 0 &&
        sorted.map((d) => {
          const a = aspect(d);
          return (
            <div
              key={d.id}
              onPointerDown={(e) => onDown(e, d)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className={`absolute select-none ${readOnly ? "" : "pointer-events-auto cursor-grab active:cursor-grabbing touch-none"} ${selectedId === d.id ? "diary-deco--selected" : ""}`}
              style={{ left: px(d.x), top: px(d.y), width: px(d.w), height: a ? px(d.w * a) : undefined, transform: `rotate(${d.rotate}deg)`, zIndex: 10 + sorted.indexOf(d) }}
            >
              <DecoView deco={d} font={font} />
            </div>
          );
        })}
    </div>
  );
}

/* ───────────── 도구 패널 (추가 + 선택 요소 속성) ───────────── */

interface ToolsProps {
  decos: DiaryDeco[];
  selectedId: string | null;
  font: string;
  token?: string;
  onSelect: (id: string | null) => void;
  onChange: (decos: DiaryDeco[]) => void;
}

type Tab = "sticker" | "tape" | "label" | "letter";
const TABS: { id: Tab; label: string }[] = [
  { id: "sticker", label: "스티커" },
  { id: "tape", label: "마테" },
  { id: "label", label: "라벨" },
  { id: "letter", label: "편지" },
];

export function DecoTools({ decos, selectedId, font, token, onSelect, onChange }: ToolsProps) {
  const [tab, setTab] = useState<Tab>("sticker");
  const [color, setColor] = useState<string>(STICKER_COLORS[0]);
  const [letters, setLetters] = useState<Letter[] | null>(null);
  useEffect(() => {
    if (tab !== "letter" || letters || !token) return;
    getMyLetters(token, { limit: 30 })
      .then((r) => setLetters(r.data))
      .catch(() => setLetters([]));
  }, [tab, letters, token]);
  const sel = decos.find((d) => d.id === selectedId) ?? null;
  const full = decos.length >= MAX_DECOS;

  const add = (partial: Omit<DiaryDeco, "id" | "x" | "y" | "rotate" | "z">) => {
    if (full) return;
    const z = decos.reduce((m, d) => Math.max(m, d.z), 0) + 1;
    const d: DiaryDeco = { id: newDecoId(), ...randomPlacement(), z, ...partial };
    onChange([...decos, d]);
    onSelect(d.id);
  };
  const patch = (p: Partial<DiaryDeco>) => sel && onChange(decos.map((d) => (d.id === sel.id ? { ...d, ...p } : d)));
  const remove = () => {
    if (!sel) return;
    onChange(decos.filter((d) => d.id !== sel.id));
    onSelect(null);
  };
  const toFront = () => patch({ z: decos.reduce((m, d) => Math.max(m, d.z), 0) + 1 });
  const toBack = () => patch({ z: decos.reduce((m, d) => Math.min(m, d.z), 0) - 1 });

  const chip = "px-3 py-1 rounded-full border border-[#C4C4C4] text-sm hover:border-[#FF9883] disabled:opacity-40";

  return (
    <div className="rounded-lg border border-[#C4C4C4] bg-white text-sm text-[#424242]">
      {/* 탭 */}
      <div className="flex border-b border-[#E5E5E5]">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 ${tab === t.id ? "text-[#FF7F65] border-b-2 border-[#FF9883] font-medium" : "text-[#757575]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 추가 */}
      <div className="p-3">
        {tab === "sticker" && (
          <>
            <div className="flex gap-2 mb-3">
              {STICKER_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} aria-label={`잉크색 ${c}`} className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-[#2B3446]" : "border-transparent"}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(STICKERS).map(([id, s]) => (
                <button key={id} disabled={full} onClick={() => add({ type: "sticker", src: id, w: 12, color })} title={s.label} className="aspect-square rounded-md bg-[#F7F5F0] hover:bg-[#FFE9E3] p-1.5 disabled:opacity-40" style={{ color }}>
                  <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
                    <path d={s.path} fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}
        {tab === "tape" && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(TAPES).map(([id, t]) => (
              <button key={id} disabled={full} onClick={() => add({ type: "tape", src: id, w: 36 })} title={t.label} className="h-7 rounded-sm disabled:opacity-40" style={{ backgroundColor: t.bg, backgroundImage: t.pattern, backgroundSize: "8px 8px" }} />
            ))}
          </div>
        )}
        {tab === "label" && (
          <button disabled={full} onClick={() => add({ type: "label", src: "", w: 28, text: "오늘의 한마디", color: "#F9C9C0" })} className={chip}>
            + 라벨 추가
          </button>
        )}
        {tab === "letter" && (
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
            {letters === null ? (
              <p className="text-xs text-[#9E9E9E]">편지를 불러오는 중...</p>
            ) : letters.length === 0 ? (
              <p className="text-xs text-[#9E9E9E]">아직 쓴 편지가 없어요. 편지를 쓰면 여기서 붙일 수 있어요.</p>
            ) : (
              letters.map((l) => (
                <button key={l._id} disabled={full} onClick={() => add({ type: "letter", src: l._id, w: 26, text: l.title })} className="text-left px-3 py-1.5 rounded-md border border-[#E5E5E5] hover:border-[#FF9883] disabled:opacity-40 truncate">
                  ✉ {l.title}
                </button>
              ))
            )}
          </div>
        )}
        {full && <p className="mt-2 text-xs text-[#9E9E9E]">한 페이지에는 {MAX_DECOS}개까지 붙일 수 있어요.</p>}
      </div>

      {/* 선택한 요소 */}
      {sel && (
        <div className="border-t border-[#E5E5E5] p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">선택한 {sel.type === "sticker" ? "스티커" : sel.type === "tape" ? "마테" : sel.type === "letter" ? "편지" : "라벨"}</span>
            <button onClick={() => onSelect(null)} className="text-[#9E9E9E] hover:text-[#424242]">선택 해제</button>
          </div>
          {sel.type === "label" && (
            <input value={sel.text ?? ""} maxLength={60} onChange={(e) => patch({ text: e.target.value })} className="border border-[#C4C4C4] rounded-md px-3 py-1.5 text-base focus:outline-none focus:border-[#FF9883]" style={{ fontFamily: font }} />
          )}
          <label className="flex items-center gap-3">
            <span className="w-10 text-[#757575]">회전</span>
            <button onClick={() => patch({ rotate: Math.max(-180, sel.rotate - 15) })} className={chip}>−15°</button>
            <input type="range" min={-180} max={180} step={1} value={sel.rotate} onChange={(e) => patch({ rotate: Number(e.target.value) })} className="flex-1 accent-[#FF9883]" />
            <button onClick={() => patch({ rotate: Math.min(180, sel.rotate + 15) })} className={chip}>+15°</button>
          </label>
          <label className="flex items-center gap-3">
            <span className="w-10 text-[#757575]">크기</span>
            <input type="range" min={4} max={80} step={1} value={sel.w} onChange={(e) => patch({ w: Number(e.target.value) })} className="flex-1 accent-[#FF9883]" />
            <span className="w-10 text-right tabular-nums text-[#757575]">{Math.round(sel.w)}%</span>
          </label>
          <div className="flex gap-2">
            <button onClick={toFront} className={chip}>앞으로</button>
            <button onClick={toBack} className={chip}>뒤로</button>
            <button onClick={remove} className={`${chip} ml-auto text-[#E8735C] border-[#F9C9C0]`}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
}
