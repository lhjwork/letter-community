"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

const STORAGE_KEY = "letter-typewriter-sound";

/**
 * 타이핑할 때 타자기 소리를 내는 토글.
 * - 일반 키: "탁" 하는 타건 클릭
 * - 스페이스: 낮고 묵직한 스페이스바 소리
 * - Enter: 타건 + 타자기 종소리 "딩~"
 * 음원 파일 없이 WebAudio로 합성하며, 키마다 미세하게 달라 반복감이 없다.
 */
export default function PenSoundToggle({ editor }: { editor: Editor | null }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "on") {
      setEnabled(true);
      enabledRef.current = true;
    }
  }, []);

  const getContext = useCallback(() => {
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  /** 타건 클릭: 짧은 노이즈 버스트 + 낮은 몸통 울림 */
  const playClick = useCallback(
    (soft = false) => {
      try {
        const ctx = getContext();
        const now = ctx.currentTime;
        const sr = ctx.sampleRate;

        // 금속성 클릭 (노이즈 버스트)
        const dur = 0.025 + Math.random() * 0.015;
        const buf = ctx.createBuffer(1, Math.ceil(sr * dur), sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1400 + Math.random() * 900;
        bp.Q.value = 1.4;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(soft ? 0.1 : 0.16, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        noise.connect(bp);
        bp.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

        // 키가 바닥을 치는 낮은 "퉁"
        const thump = ctx.createOscillator();
        thump.type = "sine";
        thump.frequency.setValueAtTime(170 + Math.random() * 60, now);
        thump.frequency.exponentialRampToValueAtTime(90, now + 0.04);
        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(soft ? 0.04 : 0.07, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        thump.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        thump.start(now);
        thump.stop(now + 0.06);
      } catch {
        // 사운드 재생 실패는 무시
      }
    },
    [getContext],
  );

  /** 스페이스바: 더 낮고 묵직하게 */
  const playSpace = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      const thump = ctx.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(120, now);
      thump.frequency.exponentialRampToValueAtTime(60, now + 0.06);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      thump.connect(gain);
      gain.connect(ctx.destination);
      thump.start(now);
      thump.stop(now + 0.09);
    } catch {
      // 무시
    }
  }, [getContext]);

  /** Enter: 타자기 줄바꿈 종소리 "딩~" */
  const playBell = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      // 종의 기본음 + 배음
      for (const [freq, vol] of [
        [1760, 0.06],
        [2637, 0.025],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.03);
        osc.stop(now + 0.6);
      }
    } catch {
      // 무시
    }
  }, [getContext]);

  // 에디터 키 입력에 소리 연결
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        playClick();
        playBell();
        return;
      }
      if (e.key === "Backspace") {
        playClick(true);
        return;
      }
      if (e.key === " " || e.code === "Space") {
        playSpace();
        return;
      }
      // 일반 글자 키 (한글 IME 조합 중에는 key가 "Process"로 들어옴)
      if (e.key.length === 1 || e.key === "Process") {
        playClick();
      }
    };

    dom.addEventListener("keydown", onKeyDown);
    return () => {
      dom.removeEventListener("keydown", onKeyDown);
    };
  }, [editor, playClick, playSpace, playBell]);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? "타자기 소리 끄기" : "타자기 소리 켜기"}
      className={`flex items-center gap-1 px-2 py-1 rounded border text-xs transition-colors whitespace-nowrap ${
        enabled
          ? "border-[#FF9883] text-[#FF9883] bg-orange-50"
          : "border-gray-300 text-gray-500 hover:border-gray-400"
      }`}
    >
      <span>{enabled ? "🔊" : "🔇"}</span>
      <span className="hidden sm:inline">타자기</span>
    </button>
  );
}
