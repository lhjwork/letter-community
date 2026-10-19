"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";

/* 실물 편지지(/v8/letter-paper.png) 한 장 = To. 1줄 + 본문 9줄 + From. 1줄.
 * 본문이 9줄을 넘으면 같은 편지지가 2장, 3장으로 이어 붙는다. 쓰기·읽기 화면 공용.
 * 기하는 보드 720×1012 기준, 모두 편지지 폭(cqw) 비율이라 358px 에서도 같은 코드 */
export const LINES_PER_PAGE = 9;
const PAPER = {
  sheet: 1012 / 7.2, // 140.56cqw
  line: 57.1 / 7.2, // 7.93cqw = 괘선 간격
  padL: 69 / 7.2,
  padR: 70 / 7.2,
  toTop: 215.4 / 7.2,
  bodyTop: 272.2 / 7.2,
  fromLeft: 130 / 7.2,
};
const cq = (n: number) => `${n.toFixed(4)}cqw`;
const PEN = "font-pen text-[26px] mobile-down:text-xl";
// 본문·textarea·mirror 공용 줄바꿈 규칙. keep-all: 한글도 띄어쓰기에서만 줄을 바꾼다(좁은 폭에서 "원/하시면" 방지)
const WRAP = "whitespace-pre-wrap [word-break:keep-all] [overflow-wrap:break-word]";
const penLine: CSSProperties = { lineHeight: cq(PAPER.line), height: cq(PAPER.line) };
// --baseline-shift: 보드 수치 그대로면 본문 기준선이 괘선에서 6px 떠서(원칙 2~4px) 본문만 내린다. To./From. 은 정상
const bodyBox = (top: number, lines: number): CSSProperties => ({
  left: cq(PAPER.padL),
  right: cq(PAPER.padR),
  top: `calc(${cq(PAPER.bodyTop + top * PAPER.line)} + var(--baseline-shift))`,
  height: cq(lines * PAPER.line),
  lineHeight: cq(PAPER.line),
});

type Edit = { id: string; placeholder: string; maxLength: number; onChange: (v: string) => void };

type Props = {
  label: string;
  /** 첫 장 왼쪽 위 도장(마음 편지·사연 편지 등) */
  stamp?: ReactNode;
  /** 첫 장 To. 줄 내용(텍스트 또는 입력칸) */
  to: ReactNode;
  /** 마지막 장 From. 줄 내용 */
  from: ReactNode;
  /** 첫 장 본문 첫 줄에 앉는 제목(사연 상세). 그만큼 첫 장 본문이 한 줄 준다 */
  title?: ReactNode;
  text: string;
  /** 있으면 쓰기 모드(장마다 textarea) */
  edit?: Edit;
  /** 장 수가 바뀔 때 */
  onPages?: (n: number) => void;
};

/** 본문을 장 단위로 자른 시작 위치들(2장부터). 숨은 mirror 에 전체 본문을 이어 쓰고 글자마다 몇 번째 줄인지 읽는다.
 * 줄바꿈 위치는 이어 쓴 본문과 같으니 잘라서 장마다 따로 그려도 줄이 그대로다 */
function measureBreaks(m: HTMLDivElement, text: string, firstCap: number): number[] {
  m.textContent = text + "​"; // 마지막 줄바꿈 뒤 빈 줄도 한 줄로 센다
  const node = m.firstChild;
  if (!node) return [];
  const lh = parseFloat(getComputedStyle(m).lineHeight) || 1;
  const base = m.getBoundingClientRect().top;
  const range = document.createRange();
  const n = text.length; // n 번째 글자 = 끝에 붙인 ​
  // i 번째 글자의 줄 번호. \n 은 자리가 애매해 그 뒤 첫 글자로 잰다
  const lineAt = (i: number) => {
    while (i < n && text[i] === "\n") i++;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    return Math.floor((range.getBoundingClientRect().top - base + 1) / lh);
  };
  const breaks: number[] = [];
  let lo = 0;
  // 끝 글자. 줄바꿈으로 끝날 때만 그 뒤 빈 줄(\u200b)까지 센다. 꽉 찬 줄 끝 공백 때문에 빈 장이 생기지 않게
  const lastIdx = n && text[n - 1] !== "\n" ? n - 1 : n;
  for (let limit = firstCap; lineAt(lastIdx) >= limit; limit += LINES_PER_PAGE) {
    // limit 줄 이상에 놓인 첫 글자
    let a = lo + 1;
    let b = n;
    while (a < b) {
      const mid = (a + b) >> 1;
      if (lineAt(mid) >= limit) b = mid;
      else a = mid + 1;
    }
    // 장 끝 줄바꿈은 앞 장에 둔다. 새 장 첫 줄이 비지 않게
    while (a < n && text[a] === "\n") a++;
    breaks.push(a);
    lo = a;
  }
  return breaks;
}

export default function LetterPages({ label, stamp, to, from, title, text, edit, onPages }: Props) {
  const firstCap = LINES_PER_PAGE - (title ? 1 : 0);
  const [breaks, setBreaks] = useState<number[]>([]);
  const [tick, setTick] = useState(0); // 폭·폰트가 바뀌거나 커서만 옮길 때 다시 그린다
  const mirrorRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const areas = useRef<(HTMLTextAreaElement | null)[]>([]);
  const composing = useRef(false);
  // 지금 펼친 장과 넘긴 방향(넘김 애니메이션용)
  const [view, setView] = useState<{ page: number; dir: "" | "next" | "prev" }>({ page: 0, dir: "" });
  // 입력 뒤 커서를 둘 전체 본문 위치. page 를 주면 그 장에 둔다(장 경계는 두 장이 같은 위치를 가져서)
  const caret = useRef<{ pos: number; page?: number } | null>(null);

  const starts = [0, ...breaks];
  const pages = starts.map((s, i) => text.slice(s, starts[i + 1] ?? text.length));
  const cur = Math.min(view.page, pages.length - 1);
  const go = (page: number) => setView({ page, dir: page < cur ? "prev" : "next" });

  useLayoutEffect(() => {
    if (composing.current || !mirrorRef.current) return;
    const next = measureBreaks(mirrorRef.current, text, firstCap);
    if (next.join() !== breaks.join()) return setBreaks(next); // 새 장 나눔으로 다시 그린 뒤 커서를 놓는다
    const c = caret.current;
    if (!c) return;
    let j = c.page ?? 0;
    if (c.page === undefined) while (j < breaks.length && breaks[j] <= c.pos) j++;
    if (j !== cur) return setView({ page: j, dir: j < cur ? "prev" : "next" }); // 그 장을 펼친 뒤(보여야 focus 가 된다) 커서를 놓는다
    caret.current = null;
    const ta = areas.current[j];
    if (!ta) return;
    if (document.activeElement !== ta) ta.focus();
    const local = c.pos - (j ? breaks[j - 1] : 0);
    ta.setSelectionRange(local, local);
  }, [text, firstCap, breaks, tick, cur]);

  useEffect(() => onPages?.(starts.length), [onPages, starts.length]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    let width = sheet.clientWidth;
    const ro = new ResizeObserver(() => {
      if (sheet.clientWidth === width) return;
      width = sheet.clientWidth;
      setTick((t) => t + 1);
    });
    ro.observe(sheet);
    // 펜 글꼴은 글자 묶음(unicode-range)마다 늦게 받아진다. 받을 때마다 다시 재야 대체 글꼴 폭으로 나눈 장이 남지 않는다
    const refit = () => setTick((t) => t + 1);
    document.fonts?.ready.then(refit);
    document.fonts?.addEventListener("loadingdone", refit);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener("loadingdone", refit);
    };
  }, []);

  /** k 장 textarea 가 v 로 바뀜. 뒤 장 시작 위치는 길이 차만큼 밀어 두고(조합 중에는 그대로 둠) 다시 재는 건 layout effect 몫 */
  const change = (k: number, v: string, sel: number) => {
    if (!edit) return;
    const end = starts[k + 1] ?? text.length;
    const next = text.slice(0, starts[k]) + v + text.slice(end);
    if (next.length > edit.maxLength && next.length > text.length) return;
    const delta = v.length - (end - starts[k]);
    setBreaks(breaks.map((b, i) => (i >= k ? b + delta : b)));
    if (!composing.current) caret.current = { pos: starts[k] + sel };
    edit.onChange(next);
  };

  // 장 경계에서 지우기·화살표가 앞뒤 장으로 이어지게
  const onKey = (k: number) => (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!edit || e.nativeEvent.isComposing) return;
    const ta = e.currentTarget;
    if (ta.selectionStart !== ta.selectionEnd) return;
    const at = ta.selectionStart;
    const start = starts[k];
    const end = starts[k + 1] ?? text.length;
    const first = k === 0;
    const last = k === starts.length - 1;
    if (e.key === "Backspace" && at === 0 && !first) {
      e.preventDefault();
      caret.current = { pos: start - 1 };
      edit.onChange(text.slice(0, start - 1) + text.slice(start));
    } else if (e.key === "Delete" && at === ta.value.length && !last) {
      e.preventDefault();
      caret.current = { pos: end, page: k };
      edit.onChange(text.slice(0, end) + text.slice(end + 1));
    } else if (e.key === "ArrowLeft" && at === 0 && !first) {
      e.preventDefault();
      caret.current = { pos: start - (text[start - 1] === "\n" ? 1 : 0), page: k - 1 };
      setTick((t) => t + 1);
    } else if (e.key === "ArrowRight" && at === ta.value.length && !last) {
      e.preventDefault();
      caret.current = { pos: end, page: k + 1 };
      setTick((t) => t + 1);
    }
  };

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-3" role="group" aria-label={label}>
      {/* 모든 장을 한 칸에 겹쳐 두고 펼친 장만 보인다(안 보이는 장도 자리는 지켜서 측정·커서 이동이 된다) */}
      <div className="grid">
      {pages.map((slice, i) => {
        const first = i === 0;
        const last = i === pages.length - 1;
        const top = first && title ? 1 : 0;
        const open = i === cur;
        return (
          <div
            key={i}
            ref={first ? sheetRef : undefined}
            aria-hidden={!open}
            className={`@container relative w-full [grid-area:1/1] [--baseline-shift:3px] mobile-down:[--baseline-shift:-2px] ${open ? `z-1 ${view.dir && `page-turn-${view.dir}`}` : "invisible"} ${
              open && !last ? "shadow-[var(--paper-shadow),5px_5px_0_-1px_var(--paper),5px_5px_0_0_var(--rule)]" : "shadow-[var(--paper-shadow)]"
            }`}
          >
            <Image src="/v8/letter-paper.png" alt="" width={1024} height={1440} priority={first} aria-hidden="true" className="block max-w-none" style={{ width: "100%", height: cq(PAPER.sheet) }} />
            {first && stamp}

            {first && (
              <div className={`absolute flex items-baseline gap-2 text-brick ${PEN}`} style={{ ...penLine, left: cq(PAPER.padL), right: cq(PAPER.padR), top: cq(PAPER.toTop) }}>
                {to}
              </div>
            )}
            {first && title && (
              <div className="absolute overflow-hidden text-ellipsis whitespace-nowrap font-pen text-[30px] mobile-down:text-[22px]" style={bodyBox(0, 1)}>
                {title}
              </div>
            )}

            {edit ? (
              <textarea
                ref={(el) => {
                  areas.current[i] = el;
                }}
                id={first ? edit.id : `${edit.id}-${i + 1}`}
                aria-label={first ? undefined : `${label} ${i + 1}장`}
                placeholder={first ? edit.placeholder : undefined}
                value={slice}
                autoComplete="off"
                required={first}
                onChange={(e) => change(i, e.target.value, e.target.selectionEnd)}
                onCompositionStart={() => (composing.current = true)}
                onCompositionEnd={(e) => {
                  composing.current = false;
                  caret.current = { pos: starts[i] + e.currentTarget.selectionEnd };
                  setTick((t) => t + 1);
                }}
                onKeyDown={onKey(i)}
                className={`absolute resize-none overflow-hidden border-0 bg-transparent p-0 text-ink outline-none ${WRAP} placeholder:text-ink-3 ${PEN}`}
                style={bodyBox(top, LINES_PER_PAGE - top)}
              />
            ) : (
              <div className={`absolute overflow-hidden text-ink ${WRAP} ${PEN}`} style={bodyBox(top, LINES_PER_PAGE - top)}>
                {slice.replace(/^\n+/, "")}
              </div>
            )}

            {last && (
              <div className={`absolute m-0 text-right text-ink-2 ${PEN}`} style={{ ...penLine, left: cq(PAPER.fromLeft), right: cq(PAPER.padR), top: cq(PAPER.bodyTop + LINES_PER_PAGE * PAPER.line) }}>
                {from}
              </div>
            )}

            {/* 측정용 mirror: 본문과 같은 폭·폰트·줄바꿈 규칙. 첫 장 제목만큼 아래에서 시작할 필요는 없다(줄 번호만 센다) */}
            {first && (
              <div
                ref={mirrorRef}
                aria-hidden="true"
                className={`pointer-events-none invisible absolute top-0 ${WRAP} ${PEN}`}
                style={{ left: cq(PAPER.padL), right: cq(PAPER.padR), lineHeight: cq(PAPER.line) }}
              />
            )}
          </div>
        );
      })}
      </div>

      {pages.length > 1 && (
        <nav className="flex items-center justify-center gap-4 font-pen text-xl text-ink-2 mobile-down:text-lg" aria-label="편지지 넘기기">
          <button type="button" onClick={() => go(cur - 1)} disabled={cur === 0} className="inline-flex min-h-11 items-center px-2 hover:text-brick disabled:opacity-30">
            ‹ 앞 장
          </button>
          <span className="font-anton text-sm tracking-[0.1em] text-ink-3" aria-live="polite">
            {cur + 1} / {pages.length}
          </span>
          <button type="button" onClick={() => go(cur + 1)} disabled={cur === pages.length - 1} className="inline-flex min-h-11 items-center px-2 hover:text-brick disabled:opacity-30">
            다음 장 ›
          </button>
        </nav>
      )}
    </div>
  );
}
