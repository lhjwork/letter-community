"use client";

import { useState } from "react";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const editor = useLetterEditor({
    content,
    onChange: setContent,
    placeholder: "여기에 당신의 이야기를 작성해주세요...",
  });

  const handleSubmit = () => {
    console.log({ title, content, author });
    // TODO: API 호출
  };

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <main className="w-full flex flex-col items-center py-16 px-4 sm:px-8">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">당신의 이야기를 들려주세요</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">특별한 순간을 편지로 남겨보세요</p>
        </div>

        {/* 편지지 스타일 컨테이너 */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 에디터 툴바 (상단 고정) */}
          <div className="relative z-20 bg-white border-b">
            <EditorToolbar editor={editor} />
          </div>

          {/* 편지지 구멍 (바인더 효과) - absolute로 배치되므로 부모 relative 기준 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-300 z-10 pointer-events-none"></div>
          <div className="absolute left-6 top-[60px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[100px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[140px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[180px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-28 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-20 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-12 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-4 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>

          {/* 편지지 내용 영역 */}
          <div
            className="pl-16 pr-8 py-12 h-[800px] overflow-y-auto relative scrollbar-hide"
            style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 27px,
                #e5e7eb 27px,
                #e5e7eb 28px
              )`,
              backgroundSize: "100% 28px",
              backgroundAttachment: "local",
            }}
          >
            {/* 편지 헤더 */}
            <div className="mb-8">
              <div className="text-right text-sm text-gray-500 mb-2">{today}</div>
              <div className="text-left text-base text-gray-700 mb-4">To Letter</div>

              {/* 제목 입력 */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full bg-transparent border-none outline-none text-xl font-semibold text-gray-800 placeholder-gray-400 mb-6"
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  lineHeight: "28px",
                }}
              />
            </div>

            {/* Tiptap 에디터 */}
            <div className="relative z-10 mb-20">
              <EditorContent editor={editor} />
            </div>

            {/* 편지 마무리 */}
            <div className="mt-12 flex justify-end items-center pb-8">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="작성자"
                className="text-right bg-transparent border-none outline-none text-base text-gray-700 placeholder-gray-400 w-32"
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              />
              <span className="ml-2">💌</span>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              setTitle("");
              setContent("");
              setAuthor("");
            }}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            초기화
          </button>
          <button onClick={handleSubmit} className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            사연 제출하기
          </button>
        </div>
      </main>
    </div>
  );
}
