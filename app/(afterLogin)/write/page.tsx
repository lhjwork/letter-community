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
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState("");

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
    enableImages: letterType === "story", // 사연에만 이미지 기능 활성화
  });

  // AI 제목 생성 함수 (버튼 클릭 시 호출)
  const generateAITitle = async () => {
    if (letterType === "friend" && content) {
      const plainContent = content.replace(/<[^>]*>/g, "").trim();

      if (canGenerateTitle(plainContent)) {
        setIsGeneratingTitle(true);
        try {
          const generatedTitle = await generateTitle(plainContent);
          setAiGeneratedTitle(generatedTitle);
          setTitle(generatedTitle);
        } catch (error) {
          console.error("제목 생성 실패:", error);
          alert("제목 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
          setIsGeneratingTitle(false);
        }
      } else {
        alert("제목을 생성하기 위해서는 더 많은 내용을 작성해주세요.");
      }
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const regenerateTitle = async () => {
    await generateAITitle();
  };

  const handleSubmit = async () => {
    // 내용 유효성 검사
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // HTML 형식 그대로 사용
    const htmlContent = content.trim();

    // 미리보기용 일반 텍스트 (OG 이미지, 검색용)
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
      // 일반 편지의 경우 제목이 없으면 사용자에게 안내
      if (!title.trim()) {
        const shouldGenerate = confirm("제목이 없습니다. AI로 제목을 생성하시겠습니까?");
        if (shouldGenerate) {
          await generateAITitle();
          return; // 제목 생성 후 다시 제출하도록 함
        } else {
          alert("제목을 입력하거나 AI 제목 생성을 사용해주세요.");
          return;
        }
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
            content: htmlContent,
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
        // 일반 편지 - URL 공유
        const ogPreviewText = plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

        // 편지 생성
        result = await createLetter(
          {
            title: title.trim(),
            content: htmlContent,
            type: "friend",
            ogTitle: title.trim(),
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
    setAiGeneratedTitle("");
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
                <span className="font-medium">AI 제목 생성</span>
              </div>
              <p className="text-sm text-blue-600">편지 내용을 작성한 후 &ldquo;AI 제목 생성&rdquo; 버튼을 클릭하여 제목을 자동으로 생성할 수 있습니다.</p>
            </div>
          </div>
        )}

        {/* 편지지 스타일 컨테이너 */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 에디터 툴바 (상단 고정) */}
          <div className="relative z-20 bg-white border-b">
            <EditorToolbar editor={editor} enableImages={letterType === "story"} />
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

              {/* 제목 입력 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={letterType === "story" ? "제목을 입력하세요" : "AI가 제목을 생성 중입니다..."}
                    className="flex-1 bg-transparent border-none outline-none text-xl font-semibold text-gray-800 placeholder-gray-400"
                    style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      lineHeight: "28px",
                    }}
                  />

                  {/* AI 제목 생성 관련 버튼들 (일반 편지일 때만) */}
                  {letterType === "friend" && (
                    <div className="flex items-center gap-2">
                      {isGeneratingTitle && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>}

                      <button
                        onClick={generateAITitle}
                        disabled={isGeneratingTitle || !content.replace(/<[^>]*>/g, "").trim()}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={"AI로 제목 생성"}
                      >
                        {isGeneratingTitle ? "생성 중..." : "🤖 AI 제목 생성"}
                      </button>

                      {aiGeneratedTitle && !isGeneratingTitle && (
                        <button onClick={regenerateTitle} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors" title={"제목 다시 생성"}>
                          🔄 재생성
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* AI 제목 생성 상태 표시 */}
                {letterType === "friend" && (
                  <div className="text-xs text-gray-500">
                    {isGeneratingTitle ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">🤖</span>
                        AI가 제목을 생성하고 있습니다...
                      </span>
                    ) : aiGeneratedTitle ? (
                      <span className="text-green-600">✨ AI가 생성한 제목입니다. 마음에 들지 않으면 직접 수정하세요.</span>
                    ) : (
                      <span className="text-gray-400">편지 내용을 작성한 후 &ldquo;AI 제목 생성&rdquo; 버튼을 클릭하세요.</span>
                    )}
                  </div>
                )}
              </div>
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
            {isSubmitting ? (letterType === "story" ? "AI 분류 중..." : "편지 생성 중...") : letterType === "story" ? "사연 제출하기" : "편지 만들기"}
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
