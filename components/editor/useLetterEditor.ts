"use client";

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
  // 기본 확장 기능들
  const baseExtensions = [
    StarterKit,
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: enableImages ? ["heading", "paragraph", "image"] : ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Underline,
  ];

  // 이미지 기능이 활성화된 경우에만 이미지 확장 추가
  const extensions = enableImages ? [...baseExtensions, ResizableImage] : baseExtensions;
  return useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] text-lg leading-7 text-gray-800 max-w-none",
        style: "line-height: 28px; font-family: 'Noto Sans KR', sans-serif;",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });
}
