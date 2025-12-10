"use client";

import { type Editor } from "@tiptap/react";
import { Bold, Italic, Strikethrough, Underline, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Image as ImageIcon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // 에디터 상태 변경 시 강제 리렌더링을 위한 상태
  const [, forceUpdate] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // 트랜잭션(내용 변경, 선택 변경 등)이 발생할 때마다 리렌더링
    const handleUpdate = () => forceUpdate((prev) => prev + 1);

    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);
    editor.on("focus", handleUpdate);
    editor.on("blur", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
      editor.off("focus", handleUpdate);
      editor.off("blur", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const activeClass = "bg-neutral-200 text-black";
  const inactiveClass = "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900";

  // 현재 선택된 텍스트의 색상과 배경색 가져오기
  const textStyleAttrs = editor.getAttributes("textStyle");
  const highlightAttrs = editor.getAttributes("highlight");

  const currentTextColor = textStyleAttrs.color || "#000000";
  const currentHighlightColor = highlightAttrs.color || "transparent";
  const hasTextColor = !!textStyleAttrs.color;
  const hasHighlight = editor.isActive("highlight");

  const colors = [
    { name: "기본", textColor: "#000000", bgColor: "transparent" },
    { name: "회색", textColor: "#9ca3af", bgColor: "#f3f4f6" },
    { name: "갈색", textColor: "#92400e", bgColor: "#fef3c7" },
    { name: "주황", textColor: "#ea580c", bgColor: "#fed7aa" },
    { name: "노랑", textColor: "#ca8a04", bgColor: "#fef08a" },
    { name: "초록", textColor: "#16a34a", bgColor: "#bbf7d0" },
    { name: "파랑", textColor: "#2563eb", bgColor: "#bfdbfe" },
    { name: "보라", textColor: "#9333ea", bgColor: "#e9d5ff" },
    { name: "분홍", textColor: "#db2777", bgColor: "#fbcfe8" },
    { name: "빨강", textColor: "#dc2626", bgColor: "#fecaca" },
  ];

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 items-center bg-white sticky top-0 z-10">
      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? activeClass : inactiveClass} title="굵게">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? activeClass : inactiveClass} title="기울임">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? activeClass : inactiveClass} title="밑줄">
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? activeClass : inactiveClass} title="취소선">
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? activeClass : inactiveClass}
          title="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? activeClass : inactiveClass}
          title="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? activeClass : inactiveClass}
          title="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? activeClass : inactiveClass}
          title="제목 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? activeClass : inactiveClass}
          title="제목 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? activeClass : inactiveClass}
          title="제목 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          <ImageIcon className="h-4 w-4" />
        </label>
      </div>

      <div className="flex items-center gap-3 border-l pl-2 ml-2">
        {/* Combined Color Picker (Text & Background) */}
        <div className="relative" ref={colorPickerRef}>
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 border border-gray-200" title="색상">
            <div className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: hasHighlight ? currentHighlightColor : "transparent",
                }}
              >
                <span className="text-sm font-bold" style={{ color: hasTextColor ? currentTextColor : "#000000" }}>
                  A
                </span>
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-[240px]">
              {/* 텍스트 색상 */}
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-2">텍스트 색상</div>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((item) => (
                    <button
                      key={`text-${item.name}`}
                      onClick={() => {
                        if (item.textColor === "#000000") {
                          editor.chain().focus().unsetColor().run();
                        } else {
                          editor.chain().focus().setColor(item.textColor).run();
                        }
                      }}
                      className="group relative"
                      title={item.name}
                    >
                      <div
                        className={`w-9 h-9 rounded border-2 transition-all flex items-center justify-center ${
                          currentTextColor === item.textColor ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: "#ffffff" }}
                      >
                        <span className="text-sm font-bold" style={{ color: item.textColor }}>
                          A
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 배경 색상 */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">배경 색상</div>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((item) => (
                    <button
                      key={`bg-${item.name}`}
                      onClick={() => {
                        if (item.bgColor === "transparent") {
                          editor.chain().focus().unsetHighlight().run();
                        } else {
                          editor.chain().focus().setHighlight({ color: item.bgColor }).run();
                        }
                      }}
                      className="group relative"
                      title={item.name}
                    >
                      <div
                        className={`w-9 h-9 rounded border-2 transition-all flex items-center justify-center ${
                          currentHighlightColor === item.bgColor || (item.bgColor === "transparent" && !hasHighlight) ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor: item.bgColor === "transparent" ? "#ffffff" : item.bgColor,
                        }}
                      >
                        {item.bgColor === "transparent" ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-0.5 bg-red-500 rotate-45" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-700">A</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
