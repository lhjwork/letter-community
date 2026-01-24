"use client";

import { useState, useEffect } from "react";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";
import { createStory, createLetter } from "@/lib/api";
import { generateTitle, canGenerateTitle } from "@/lib/ai-title-generator";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classifyCategory } from "@/lib/categoryClassifier";
import ShareModal from "@/components/ShareModal";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { getDraft } from "@/lib/draft-api";
import SaveIndicator from "@/components/letter/SaveIndicator";
import DraftSaveButton from "@/components/letter/DraftSaveButton";
import DraftLoadButton from "@/components/drafts/DraftLoadButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Suspense } from "react";
import { DraftLetter } from "@/types/draft";
import { HeroBanner } from "@/components/home";

type LetterType = "story" | "friend";

function WritePageContent() {
  const [letterType, setLetterType] = useState<LetterType>("story");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 정적 배너 데이터 (fs 모듈 사용 불가로 인한 임시 해결)
  const bannerSlides = [
    {
      id: 1,
      image: "/images/mainbanner/banner-1.png",
      alt: "배너 1",
    },
  ];

  // 임시저장 관련 상태
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(
    draftId || undefined,
  );
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!draftId);

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
    onChange: (newContent) => {
      setContent(newContent);
      setHasUnsavedChanges(true);
    },
    placeholder:
      letterType === "story"
        ? "여기에 당신의 이야기를 작성해주세요..."
        : "여기에 당신의 마음을 담아주세요...",
    enableImages: letterType === "story", // 사연에만 이미지 기능 활성화
  });

  // 임시저장 훅
  const { saveState, manualSave } = useDraftManualSave({
    content,
    title,
    type: letterType,
    category: "기타", // 기본 카테고리
    draftId: currentDraftId,
    onSave: (savedDraftId) => {
      setCurrentDraftId(savedDraftId);
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error("저장 실패:", error);
      alert(error);
    },
  });

  // 페이지 이탈 경고
  useBeforeUnload({
    when: hasUnsavedChanges && (content.length > 10 || title.length > 0),
    message: "작성 중인 편지가 저장되지 않았습니다. 정말 나가시겠습니까?",
  });

  // 임시저장 불러오기
  useEffect(() => {
    const loadDraft = async (id: string) => {
      if (!session?.backendToken) return;

      setIsLoadingDraft(true);
      try {
        const response = await getDraft(session.backendToken, id);
        if (response.success) {
          const draft = response.data;
          setTitle(draft.title);
          setContent(draft.content);
          setLetterType(draft.type);
          setCurrentDraftId(draft._id);
          setHasUnsavedChanges(false);

          // 에디터 내용 업데이트
          if (editor) {
            editor.commands.setContent(draft.content);
          }
        }
      } catch (error) {
        console.error("임시저장 불러오기 실패:", error);
        alert("임시저장을 불러올 수 없습니다.");
      } finally {
        setIsLoadingDraft(false);
      }
    };

    if (draftId && session?.backendToken) {
      loadDraft(draftId);
    }
  }, [draftId, session?.backendToken, editor]);

  // 키보드 단축키 (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [manualSave]);

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
          setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleLetterTypeChange = (newType: LetterType) => {
    setLetterType(newType);
    setHasUnsavedChanges(true);
  };

  const regenerateTitle = async () => {
    await generateAITitle();
  };

  const handleCancel = () => {
    if (
      hasUnsavedChanges &&
      !confirm("작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?")
    ) {
      return;
    }

    router.back();
  };

  const handleSubmit = async () => {
    // 내용 유효성 검사
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = session?.backendToken;

      // HTML 형식 그대로 사용
      const htmlContent = content.trim();

      // 미리보기용 일반 텍스트 (OG 이미지, 검색용)
      const plainContent = content.replace(/<[^>]*>/g, "").trim();

      const ogPreviewText =
        plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

      let result;

      if (letterType === "story") {
        // 사연 등록
        const classificationResult = classifyCategory(
          title.trim(),
          plainContent,
        );
        const aiCategory = classificationResult.category;
        const aiMetadata = {
          confidence: classificationResult.confidence,
          reason: classificationResult.reason,
          tags: classificationResult.tags,
          classifiedAt: new Date().toISOString(),
          model: "keyword-based-frontend",
        };

        result = await createStory(
          {
            title: title.trim(),
            content: htmlContent,
            authorName: session?.user?.name || "익명",
            ogTitle: title.trim(),
            ogPreviewText,
            category: aiCategory,
            isPublic,
            aiMetadata,
          },
          token,
        );

        alert(`사연이 "${aiCategory}" 카테고리로 등록되었습니다! 💌`);

        // 성공적으로 발행되면 임시저장 상태 초기화
        setHasUnsavedChanges(false);

        // 사연 상세 페이지로 이동
        if (result?.data?._id) {
          router.push(`/letter/${result.data._id}`);
        } else {
          router.push("/stories");
        }
      } else {
        // 일반 편지 - URL 공유
        result = await createLetter(
          {
            title: title.trim(),
            content: htmlContent,
            type: "friend",
            ogTitle: title.trim(),
            ogPreviewText,
          },
          token,
        );

        // 공유 모달 표시
        setShareData({
          url: result.data.url,
          title: result.data.title,
        });
        setShowShareModal(true);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "등록에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    setShareData(null);
    // 편지 작성 완료 후 홈으로 이동
    router.push("/");
  };

  // 임시저장 불러오기 핸들러
  const handleLoadDraft = (draft: DraftLetter) => {
    if (hasUnsavedChanges) {
      const shouldContinue = confirm(
        "현재 작성 중인 내용이 있습니다. 임시저장을 불러오시겠습니까?",
      );
      if (!shouldContinue) return;
    }

    setTitle(draft.title);
    setContent(draft.content);
    setLetterType(draft.type);
    setCurrentDraftId(draft._id);
    setHasUnsavedChanges(false);

    // 에디터 내용 업데이트
    if (editor) {
      editor.commands.setContent(draft.content);
    }
  };

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>임시저장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 베너 */}
      {bannerSlides.length > 0 && (
        <div className="container mx-auto px-20 py-12">
          <HeroBanner bannerSlides={bannerSlides} />
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-[#FF9883] border-[#FF9883] hover:bg-orange-50 px-6 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
        </div>

        {/* 편지 유형 선택 */}
        <section className="mb-12">
          <h2
            className="text-5xl font-bold text-gray-700 mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            편지 유형을 선택해주세요
          </h2>

          <div className="w-full max-w-4xl mb-6">
            <Select value={letterType} onValueChange={handleLetterTypeChange}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="편지 유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="story">사연 (공개)</SelectItem>
                <SelectItem value="friend">일반 편지 (URL 공유)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* 제목 입력 */}
        <section className="mb-12">
          <h2
            className="text-5xl font-bold text-gray-700 mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            편지의 제목을 정해주세요
          </h2>

          <div className="bg-white border border-gray-300 rounded-lg p-7">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="내용을 입력해주세요"
              className="w-full text-xl text-gray-700 placeholder-gray-400 border-none outline-none"
            />
          </div>

          <p className="text-gray-600 text-xl mt-4">
            {letterType === "story"
              ? "제목이 떠오르지 않아도 괜찮아요. 레터가 내용을 바탕으로 제목을 제안해드려요."
              : "편지 내용을 작성한 후 AI 제목 생성 버튼을 클릭하여 제목을 자동으로 생성할 수 있습니다."}
          </p>
        </section>

        {/* 내용 작성 */}
        <section className="mb-12">
          <h2
            className="text-5xl font-bold text-gray-700 mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            {letterType === "story"
              ? "어떤 이야기를 건네고 싶으신가요?"
              : "어떤 마음을 전하고 싶으신가요?"}
          </h2>

          {/* 편지지 스타일 컨테이너 */}
          <div className="w-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
            {/* 에디터 툴바 (상단 고정) */}
            <div className="relative z-20 bg-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <EditorToolbar
                    editor={editor}
                    enableImages={letterType === "story"}
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                  <SaveIndicator saveState={saveState} />
                  <DraftSaveButton onSave={manualSave} saveState={saveState} />
                  <DraftLoadButton onLoadDraft={handleLoadDraft} />
                </div>
              </div>
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
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-left text-base text-gray-700 mb-4">
                  {letterType === "story" ? "To Letter" : "To Someone Special"}
                </div>

                {/* AI 제목 생성 관련 버튼들 (일반 편지일 때만) */}
                {letterType === "friend" && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {isGeneratingTitle && (
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      )}

                      <button
                        onClick={generateAITitle}
                        disabled={
                          isGeneratingTitle ||
                          !content.replace(/<[^>]*>/g, "").trim()
                        }
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={"AI로 제목 생성"}
                      >
                        {isGeneratingTitle ? "생성 중..." : "🤖 AI 제목 생성"}
                      </button>

                      {aiGeneratedTitle && !isGeneratingTitle && (
                        <button
                          onClick={regenerateTitle}
                          className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          title={"제목 다시 생성"}
                        >
                          🔄 재생성
                        </button>
                      )}
                    </div>

                    {/* AI 제목 생성 상태 표시 */}
                    <div className="text-xs text-gray-500">
                      {isGeneratingTitle ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-pulse">🤖</span>
                          AI가 제목을 생성하고 있습니다...
                        </span>
                      ) : aiGeneratedTitle ? (
                        <span className="text-green-600">
                          ✨ AI가 생성한 제목입니다. 마음에 들지 않으면 직접
                          수정하세요.
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          편지 내용을 작성한 후 &quot;AI 제목 생성&quot; 버튼을
                          클릭하세요.
                        </span>
                      )}
                    </div>
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
                      value={session?.user?.name || ""}
                      placeholder="작성자"
                      className="text-right bg-transparent border-none outline-none text-base text-gray-700 placeholder-gray-400 w-32"
                      style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                      }}
                      readOnly
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
        </section>

        {/* 구분선 */}
        <div className="border-t border-gray-300 mb-12"></div>

        {/* 공개 여부 선택 (사연일 때만) */}
        {letterType === "story" && (
          <section className="mb-12">
            <h2
              className="text-5xl font-bold text-gray-700 mb-8"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              사연의 공개 여부를 선택해주세요
            </h2>

            <div className="flex space-x-8 mb-6">
              {/* 공개하기 버튼 */}
              <button
                onClick={() => setIsPublic(true)}
                className="flex items-center space-x-4 px-7 py-4 rounded-lg border bg-white border-[#C4C4C4] hover:bg-gray-50 transition-colors min-w-[288px]"
              >
                <span className="text-gray-800 text-xl font-medium">
                  모두에게 공개하기
                </span>
                {isPublic ? (
                  <CheckSquare className="w-6 h-6 text-[#FF9883]" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
                )}
              </button>

              {/* 비공개 버튼 */}
              <button
                onClick={() => setIsPublic(false)}
                className="flex items-center space-x-4 px-7 py-4 rounded-lg border bg-white border-[#C4C4C4] hover:bg-gray-50 transition-colors min-w-[288px]"
              >
                <span className="text-gray-800 text-xl font-medium">
                  공개하지 않기
                </span>
                {!isPublic ? (
                  <CheckSquare className="w-6 h-6 text-[#FF9883]" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
                )}
              </button>
            </div>

            <p className="text-gray-600 text-xl">
              공개하지 않은 사연은 레터만 확인할 수 있어요
            </p>
          </section>
        )}

        <div className="w-full h-px bg-[#C4C4C4] mb-14"></div>

        {/* 액션 버튼 */}
        <section className="flex justify-end space-x-8 mb-16">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-4 text-xl border-gray-400 text-gray-600 hover:bg-gray-50 min-w-[168px] h-[60px]"
          >
            취소
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-4 text-xl bg-[#FF9883] text-white border-[#FF9883] hover:bg-orange-600 min-w-[168px] h-[60px]"
          >
            {isSubmitting ? "작성 중..." : "작성 완료"}
          </Button>
        </section>
      </main>

      {/* URL 공유 모달 */}
      {shareData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          letterUrl={shareData.url}
          letterTitle={shareData.title}
        />
      )}
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      }
    >
      <WritePageContent />
    </Suspense>
  );
}
