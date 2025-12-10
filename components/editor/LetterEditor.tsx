"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface LetterEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function LetterEditor({
  content,
  onChange,
  placeholder = "여기에 당신의 이야기를 작성해주세요...",
}: LetterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] text-lg leading-7 text-gray-800",
        style: "line-height: 28px; font-family: 'Noto Sans KR', sans-serif;",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
