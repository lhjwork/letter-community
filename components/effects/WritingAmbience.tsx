"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

const LINE_HEIGHT = 28;

interface Sheen {
  id: number;
  top: number;
}

/**
 * 작성 중 종이가 은은하게 반응하는 앰비언스 효과.
 * 타이핑을 멈추면 방금 쓴 줄에 잉크가 마르는 듯한 광택이 한 번 스친다.
 * relative 컨테이너 안에서 EditorContent와 함께 사용한다.
 */
export default function WritingAmbience({ editor }: { editor: Editor | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sheens, setSheens] = useState<Sheen[]>([]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const lineTopRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateLine = () => {
      const el = containerRef.current;
      if (!el) return;
      try {
        const coords = editor.view.coordsAtPos(editor.state.selection.head);
        const rect = el.getBoundingClientRect();
        lineTopRef.current = coords.top - rect.top - 2;
      } catch {
        // 좌표 계산 실패는 무시
      }
    };

    const onTransaction = ({
      transaction,
    }: {
      transaction: { docChanged: boolean };
    }) => {
      updateLine();
      if (!transaction.docChanged) return;

      // 잉크 마름 연출: 입력이 2초간 멈추면 현재 줄에 광택 한 번
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (lineTopRef.current == null) return;
        const id = ++idRef.current;
        setSheens((prev) => [
          ...prev.slice(-2),
          { id, top: lineTopRef.current! },
        ]);
        setTimeout(
          () => setSheens((prev) => prev.filter((s) => s.id !== id)),
          1300,
        );
      }, 2000);
    };

    editor.on("transaction", onTransaction);
    return () => {
      editor.off("transaction", onTransaction);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [editor]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {sheens.map((s) => (
        <div
          key={s.id}
          className="ink-dry-sheen"
          style={{ top: s.top, height: LINE_HEIGHT }}
        />
      ))}
    </div>
  );
}
