"use client";

import { useState } from "react";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";
import { createStory, sendLetterToFriend } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LetterType = "story" | "friend";

export default function WritePage() {
  const [letterType, setLetterType] = useState<LetterType>("story");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const editor = useLetterEditor({
    content,
    onChange: setContent,
    placeholder:
      letterType === "story"
        ? "여기에 당신의 이야기를 작성해주세요..."
        : "여기에 당신의 마음을 담아주세요...",
  });

  const handleSubmit = async () => {
    // 공통 유효성 검사
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 타입별 유효성 검사
    if (letterType === "story") {
      if (!author.trim()) {
        alert("작성자를 입력해주세요.");
        return;
      }
    } else {
      if (!receiverEmail.trim()) {
        alert("받는 사람 이메일을 입력해주세요.");
        return;
      }
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(receiverEmail)) {
        alert("올바른 이메일 형식을 입력해주세요.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = session?.backendToken;

      // HTML 태그 제거하여 순수 텍스트만 추출
      const plainContent = content.replace(/<[^>]*>/g, "").trim();

      let result: { data: { _id: string } } | undefined;

      if (letterType === "story") {
        // 1. AI로 카테고리 자동 분류
        let aiCategory = "기타";
        let aiMetadata:
          | {
              confidence: number;
              reason: string;
              tags: string[];
              classifiedAt: string;
              model: string;
            }
          | undefined = undefined;

        try {
          const categoryResponse = await fetch("/api/ai/categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              content: plainContent,
            }),
          });

          const categoryResult = await categoryResponse.json();

          if (categoryResult.success) {
            aiCategory = categoryResult.data.category;
            aiMetadata = {
              confidence: categoryResult.data.confidence,
              reason: categoryResult.data.reason,
              tags: categoryResult.data.tags,
              classifiedAt: new Date().toISOString(),
              model: "gemini-1.5-flash",
            };
          } else if (categoryResult.fallback) {
            aiCategory = categoryResult.fallback.category;
          }
        } catch (error) {
          console.error("AI 분류 실패:", error);
          // AI 실패해도 계속 진행 (기본 카테고리 사용)
        }

        // 2. 사연 등록 (카테고리 포함)
        result = await createStory(
          {
            title: title.trim(),
            content: plainContent,
            authorName: author.trim(),
            category: aiCategory,
            aiMetadata,
          },
          token
        );
        alert(`사연이 "${aiCategory}" 카테고리로 등록되었습니다! 💌`);
      } else {
        // 편지 보내기
        result = await sendLetterToFriend(
          {
            receiverEmail: receiverEmail.trim(),
            title: title.trim(),
            content: plainContent,
          },
          token
        );
        alert(
          "편지가 성공적으로 전송되었습니다! 💌\n받는 사람에게 이메일이 발송됩니다."
        );
      }

      // 편지 상세 페이지로 이동
      if (result?.data?._id) {
        router.push(`/letter/${result.data._id}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "등록에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setAuthor("");
    setReceiverEmail("");
    editor?.commands.clearContent();
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
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {letterType === "story"
              ? "당신의 사연을 들려주세요"
              : "친구에게 편지 쓰기"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {letterType === "story"
              ? "특별한 이야기를 사연으로 남겨보세요"
              : "소중한 사람에게 마음을 전하세요"}
          </p>
        </div>

        {/* 타입 선택 */}
        <div className="w-full max-w-4xl mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            편지 유형
          </label>
          <Select
            value={letterType}
            onValueChange={(value) => setLetterType(value as LetterType)}
          >
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue placeholder="편지 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="story">사연 (공개)</SelectItem>
              <SelectItem value="friend">일반 편지 (개인)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 편지지 스타일 컨테이너 */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 에디터 툴바 (상단 고정) */}
          <div className="relative z-20 bg-white border-b">
            <EditorToolbar editor={editor} />
          </div>

          {/* 편지지 구멍 (바인더 효과) */}
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
              <div className="text-right text-sm text-gray-500 mb-2">
                {today}
              </div>
              <div className="text-left text-base text-gray-700 mb-4">
                {letterType === "story"
                  ? "To Letter"
                  : `To ${receiverEmail || "..."}`}
              </div>

              {/* 받는 사람 이메일 (편지 타입일 때만) */}
              {letterType === "friend" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    받는 사람 이메일
                  </label>
                  <input
                    type="email"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>
              )}

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
              {letterType === "story" ? (
                <>
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
                </>
              ) : (
                <>
                  <span className="text-gray-600">
                    From. {session?.user?.name || "익명"}
                  </span>
                  <span className="ml-2 text-2xl">💌</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            초기화
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? letterType === "story"
                ? "AI 분류 중..."
                : "전송 중..."
              : letterType === "story"
              ? "사연 제출하기"
              : "편지 보내기"}
          </button>
        </div>

        {/* 안내 메시지 */}
        {letterType === "friend" && (
          <div className="mt-8 max-w-2xl text-center text-sm text-gray-500">
            <p>💡 편지를 보내면 받는 사람의 이메일로 링크가 전송됩니다.</p>
            <p className="mt-2">
              링크를 클릭하면 웹에서 편지를 확인할 수 있습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
