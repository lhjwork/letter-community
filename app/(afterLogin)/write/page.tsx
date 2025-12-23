"use client";

import { useState } from "react";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";
import { createStory, createLetter } from "@/lib/api";
import { generateTitle, canGenerateTitle } from "@/lib/ai-title-generator";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classifyCategory } from "@/lib/categoryClassifier";
import ShareModal from "@/components/ShareModal";

type LetterType = "story" | "friend";

export default function WritePage() {
  const [letterType, setLetterType] = useState<LetterType>("story");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // URL 공유 모달 상태
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const router = useRouter();
  const { data: session } = useSession();

  const editor = useLetterEditor({
    content,
    onChange: setContent,
    placeholder: letterType === "story" ? "여기에 당신의 이야기를 작성해주세요..." : "여기에 당신의 마음을 담아주세요...",
  });

  const handleSubmit = async () => {
    // 내용 유효성 검사
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // HTML 태그 제거하여 순수 텍스트만 추출
    const plainContent = content.replace(/<[^>]*>/g, "").trim();

    // 타입별 유효성 검사
    if (letterType === "story") {
      if (!title.trim()) {
        alert("제목을 입력해주세요.");
        return;
      }
      if (!author.trim()) {
        alert("작성자를 입력해주세요.");
        return;
      }
    } else {
      // 일반 편지는 AI 제목 생성 가능 여부 확인
      if (!canGenerateTitle(plainContent)) {
        alert("편지 내용이 너무 짧습니다. 최소 10자 이상 작성해주세요.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = session?.backendToken;
      let result;

      if (letterType === "story") {
        // 사연 등록 (기존 방식 유지)
        const classificationResult = classifyCategory(title.trim(), plainContent);
        const aiCategory = classificationResult.category;
        const aiMetadata = {
          confidence: classificationResult.confidence,
          reason: classificationResult.reason,
          tags: classificationResult.tags,
          classifiedAt: new Date().toISOString(),
          model: "keyword-based-frontend",
        };

        const ogPreviewText = plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

        result = await createStory(
          {
            title: title.trim(),
            content: plainContent,
            authorName: author.trim(),
            ogTitle: title.trim(),
            ogPreviewText,
            category: aiCategory,
            aiMetadata,
          },
          token
        );

        alert(`사연이 "${aiCategory}" 카테고리로 등록되었습니다! 💌`);

        // 사연은 바로 상세 페이지로 이동
        if (result?.data?._id) {
          router.push(`/letter/${result.data._id}`);
        } else {
          router.push("/");
        }
      } else {
        // 일반 편지 - AI 제목 생성 후 URL 공유
        setIsGeneratingTitle(true);

        try {
          // AI로 제목 생성
          const generatedTitle = await generateTitle(plainContent);
          const ogPreviewText = plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

          // 편지 생성
          result = await createLetter(
            {
              title: generatedTitle,
              content: plainContent,
              type: "friend",
              ogTitle: generatedTitle,
              ogPreviewText,
            },
            token
          );

          // 공유 모달 표시
          setShareData({
            url: result.data.url,
            title: result.data.title,
          });
          setShowShareModal(true);
        } catch (titleError) {
          console.error("제목 생성 실패:", titleError);
          alert("제목 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
          setIsGeneratingTitle(false);
        }
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert(error instanceof Error ? error.message : "등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setAuthor("");
    editor?.commands.clearContent();
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    setShareData(null);
    // 편지 작성 완료 후 홈으로 이동
    router.push("/");
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
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{letterType === "story" ? "당신의 사연을 들려주세요" : "편지 만들기"}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{letterType === "story" ? "특별한 이야기를 사연으로 남겨보세요" : "마음을 담은 편지를 만들어 공유해보세요"}</p>
        </div>

        {/* 타입 선택 */}
        <div className="w-full max-w-4xl mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">편지 유형</label>
          <Select value={letterType} onValueChange={(value) => setLetterType(value as LetterType)}>
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue placeholder="편지 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="story">사연 (공개)</SelectItem>
              <SelectItem value="friend">일반 편지 (URL 공유)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI 안내 메시지 (일반 편지일 때만) */}
        {letterType === "friend" && (
          <div className="w-full max-w-4xl mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <span>🤖</span>
                <span className="font-medium">AI 제목 자동 생성 + URL 공유</span>
              </div>
              <p className="text-sm text-blue-600">편지 내용을 바탕으로 제목을 자동 생성하고, 공유 가능한 링크를 만들어드립니다</p>
            </div>
          </div>
        )}

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
              <div className="text-right text-sm text-gray-500 mb-2">{today}</div>
              <div className="text-left text-base text-gray-700 mb-4">{letterType === "story" ? "To Letter" : "To Someone Special"}</div>

              {/* 제목 입력 (사연일 때만) */}
              {letterType === "story" && (
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
              )}

              {/* AI 제목 생성 안내 (일반 편지일 때만) */}
              {letterType === "friend" && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 flex items-center gap-2">
                    <span>✨</span>
                    AI가 편지 내용을 바탕으로 제목을 자동 생성합니다
                  </p>
                </div>
              )}
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
                  <span className="text-gray-600">From. {session?.user?.name || "익명"}</span>
                  <span className="ml-2 text-2xl">💌</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 로딩 상태 표시 */}
        {isGeneratingTitle && (
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            AI가 제목을 생성하고 있습니다...
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleReset}
            disabled={isSubmitting || isGeneratingTitle}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            초기화
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isGeneratingTitle}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isGeneratingTitle ? (letterType === "story" ? "AI 분류 중..." : "편지 생성 중...") : letterType === "story" ? "사연 제출하기" : "편지 만들기"}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 max-w-2xl text-center text-sm text-gray-500">
          {letterType === "story" ? (
            <p>💡 사연은 공개되어 다른 사용자들이 볼 수 있습니다.</p>
          ) : (
            <>
              <p>💡 편지 완성 후 공유 가능한 링크를 받을 수 있습니다.</p>
              <p className="mt-2">링크를 원하는 사람에게 공유하여 편지를 전달하세요.</p>
            </>
          )}
        </div>
      </main>

      {/* URL 공유 모달 */}
      {shareData && <ShareModal isOpen={showShareModal} onClose={handleShareModalClose} letterUrl={shareData.url} letterTitle={shareData.title} />}
    </div>
  );
}
