"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

interface Cover {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MinimalTransaction {
  docChanged: boolean;
  doc: { content: { size: number } };
  before: { content: { size: number } };
}

/**
 * 타이핑한 글자가 스르륵 나타나는 효과.
 * 방금 입력된 글자 위에 종이색 덮개를 씌웠다가 걷어내는 방식이라
 * 에디터 내부(IME 조합 포함)를 전혀 건드리지 않는다 — 한글도 매 타건마다 동작.
 * relative 컨테이너 안에서 EditorContent와 함께 사용한다.
 */
export default function TypingRevealEffect({
  editor,
}: {
  editor: Editor | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [covers, setCovers] = useState<Cover[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!editor) return;

    const handler = ({
      transaction,
    }: {
      transaction: MinimalTransaction;
    }) => {
      if (!transaction.docChanged) return;
      // 글자가 늘어난 경우(입력)에만
      if (transaction.doc.content.size <= transaction.before.content.size)
        return;
      const overlay = overlayRef.current;
      if (!overlay) return;

      try {
        const head = editor.state.selection.head;
        const end = editor.view.coordsAtPos(head);

        // 방금 쓴 글자의 왼쪽 경계 (실패하거나 이상값이면 폭 기본값 사용)
        let left: number;
        try {
          left = editor.view.coordsAtPos(Math.max(head - 1, 1)).left;
        } catch {
          left = end.left - 18;
        }
        const width = end.left - left;
        if (width < 2 || width > 60) left = end.left - 18;

        const rect = overlay.getBoundingClientRect();
        const id = ++idRef.current;
        setCovers((prev) => [
          ...prev.slice(-5),
          {
            id,
            left: left - rect.left - 1,
            top: end.top - rect.top - 1,
            width: end.left - left + 2,
            height: end.bottom - end.top + 2,
          },
        ]);
        setTimeout(
          () => setCovers((prev) => prev.filter((c) => c.id !== id)),
          400,
        );
      } catch {
        // 좌표 계산 실패는 무시
      }
    };

    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
    };
  }, [editor]);

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-20">
      {covers.map((c) => (
        <span
          key={c.id}
          className="ink-cover"
          style={{
            left: c.left,
            top: c.top,
            width: c.width,
            height: c.height,
          }}
        />
      ))}
    </div>
  );
}
