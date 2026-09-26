"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ResizableImage } from "./extensions/ImageExtension";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";

interface UseLetterEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  enableImages?: boolean; // 이미지 기능 활성화 여부
}

export function useLetterEditor({ content, onChange, placeholder = "여기에 당신의 이야기를 작성해주세요...", enableImages = true }: UseLetterEditorProps) {
  // 매 렌더마다 새 extensions/editorProps 객체를 넘기면 tiptap이 키 입력마다 setOptions → view.updateState를
  // 호출해 한글 IME 조합이 끊긴다("습ㄴ디ㅏ"). 옵션 객체는 반드시 안정된 참조로 유지한다.
  const extensions = useMemo(() => {
    const base = [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: enableImages ? ["heading", "paragraph", "image"] : ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
    ];
    return enableImages ? [...base, ResizableImage] : base;
  }, [placeholder, enableImages]);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] text-xl leading-7 text-gray-800 max-w-none",
        style: "line-height: 28px; font-family: 'NanumJangMiCe', 'Noto Sans KR', sans-serif;",
      },
    }),
    [],
  );

  // content는 초기값으로만 쓴다. 이후 내용은 에디터가 진실이며 setContent 커맨드로만 바꾼다.
  const [initialContent] = useState(content);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  return useEditor({
    extensions,
    content: initialContent,
    editorProps,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    immediatelyRender: false,
  });
}
