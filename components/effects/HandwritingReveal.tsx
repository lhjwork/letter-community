"use client";

import { useEffect, useRef } from "react";

interface HandwritingRevealProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  /** 글자당 평균 지연(ms). 총 시간이 maxDuration을 넘으면 자동 축소 */
  charDelay?: number;
  /** 전체 리빌 최대 시간(ms) */
  maxDuration?: number;
  /** 글자를 따라다니는 펜 표시 여부 */
  showPen?: boolean;
}

/**
 * HTML 본문을 손글씨로 스윽스윽 써 내려가듯 나타나게 하는 컴포넌트.
 * - 각 글자가 왼쪽→오른쪽 붓질(와이프)로 등장
 * - 글자 속도에 랜덤 강약 + 문장부호 뒤 잠깐 멈춤 (사람이 쓰는 리듬)
 * - 펜(✍️)이 현재 써지는 글자를 따라 이동
 * 서식(굵게, 정렬 등)은 유지한 채 텍스트 노드만 글자 단위로 감싼다.
 */
export default function HandwritingReveal({
  html,
  className,
  style,
  charDelay = 55,
  maxDuration = 10000,
  showPen = true,
}: HandwritingRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const penRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const root = contentRef.current;
    if (!wrapper || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 1) 텍스트 노드를 단어(줄바꿈 안전) > 글자 span으로 감싸기
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    const charSpans: HTMLSpanElement[] = [];
    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      if (!text) continue;
      const frag = document.createDocumentFragment();
      for (const part of text.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          continue;
        }
        const word = document.createElement("span");
        word.className = "ink-word";
        for (const ch of part) {
          const span = document.createElement("span");
          span.className = "ink-stroke-char";
          span.textContent = ch;
          word.appendChild(span);
          charSpans.push(span);
        }
        frag.appendChild(word);
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    }
    if (charSpans.length === 0) return;

    // 2) 사람이 쓰는 듯한 리듬으로 지연 시간 배치
    let t = 350;
    const timings: number[] = [];
    for (const span of charSpans) {
      timings.push(t);
      t += charDelay * (0.6 + Math.random() * 0.9);
      const ch = span.textContent || "";
      if (/[.,!?…~:;]/.test(ch)) t += charDelay * 4; // 문장부호 뒤 멈춤
    }
    // 최대 시간 초과 시 비율 축소
    if (t > maxDuration) {
      const factor = maxDuration / t;
      for (let i = 0; i < timings.length; i++) timings[i] *= factor;
      t = maxDuration;
    }
    charSpans.forEach((span, i) => {
      span.style.animationDelay = `${Math.round(timings[i])}ms`;
    });

    // 3) 펜 팔로워 - 현재 써지는 글자를 따라 이동
    let raf = 0;
    const pen = penRef.current;
    if (showPen && pen) {
      const start = performance.now();
      let idx = 0;
      pen.style.opacity = "1";

      const frame = (now: number) => {
        const elapsed = now - start;
        while (idx < charSpans.length - 1 && timings[idx + 1] <= elapsed) idx++;
        const span = charSpans[idx];
        const wrapRect = wrapper.getBoundingClientRect();
        const rect = span.getBoundingClientRect();
        pen.style.transform = `translate(${rect.right - wrapRect.left - 2}px, ${
          rect.top - wrapRect.top - 14
        }px)`;

        if (elapsed < timings[timings.length - 1] + 500) {
          raf = requestAnimationFrame(frame);
        } else {
          pen.style.opacity = "0";
        }
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [html, charDelay, maxDuration, showPen]);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className || ""}`}
      style={style}
    >
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      {showPen && (
        <span ref={penRef} className="handwriting-pen" aria-hidden="true">
          <span className="pen-inner">✍️</span>
        </span>
      )}
    </div>
  );
}
