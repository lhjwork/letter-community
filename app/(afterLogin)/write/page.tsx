"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";
import { createLetter } from "@/lib/api";
import { generateTitle, canGenerateTitle } from "@/lib/ai-title-generator";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ShareModal from "@/components/ShareModal";
import { WritingSuggestion } from "@/components/editor/WritingSuggestion";
// import { DailyPrompt } from "@/components/ai/DailyPrompt";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { getDraft } from "@/lib/draft-api";
import SaveIndicator from "@/components/letter/SaveIndicator";
import DraftSaveButton from "@/components/letter/DraftSaveButton";
import DraftLoadButton from "@/components/drafts/DraftLoadButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { DraftLetter } from "@/types/draft";
import { HeroBanner } from "@/components/home";

function WritePageContent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 인터랙티브 효과 상태
  const prevContentLenRef = useRef(0);
  const [charCount, setCharCount] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false);
  const letterPaperControls = useAnimation();
  const envelopeControls = useAnimation();

  // 글자 수 변화 감지 & 효과 트리거
  const handleContentInteraction = useCallback((newContent: string) => {
    const plainText = newContent.replace(/<[^>]*>/g, "").trim();
    const newLen = plainText.length;
    const prevLen = prevContentLenRef.current;

    setCharCount(newLen);

    // 타이핑 중 (글자 증가)
    if (newLen > prevLen) {
      setIsDeleting(false);
      // 마일스톤 체크
      const milestones = [100, 500, 1000];
      for (const m of milestones) {
        if (prevLen < m && newLen >= m) {
          setMilestone(m);
          setTimeout(() => setMilestone(null), 1500);
          break;
        }
      }
      // 💌 봉투 반응 (50자마다 살짝 커짐)
      if (newLen > 0 && newLen % 50 < 3 && prevLen % 50 >= 48) {
        envelopeControls.start({
          scale: [1, 1.3, 1.1],
          rotate: [0, -8, 5, 0],
          transition: { duration: 0.5 },
        });
      }
    }

    // 삭제 중 (글자 감소)
    if (newLen < prevLen) {
      setIsDeleting(true);
      // 편지지 흔들림
      letterPaperControls.start({
        x: [0, -1.5, 1.5, -0.5, 0],
        transition: { duration: 0.25 },
      });
      // 전체 삭제 시 구겨짐
      if (newLen === 0 && prevLen > 10) {
        setIsCrumpling(true);
        letterPaperControls.start({
          scale: [1, 0.97, 1],
          rotate: [0, -0.5, 0],
          transition: { duration: 0.4, ease: "easeOut" },
        }).then(() => setIsCrumpling(false));
      }
    }

    prevContentLenRef.current = newLen;
  }, [letterPaperControls, envelopeControls]);

  // 잉크 프로그레스 (최대 2000자 기준)
  const inkProgress = Math.min(charCount / 2000, 1);
  const inkColor = isDeleting
    ? `rgba(255, 152, 131, ${0.3 + inkProgress * 0.4})`
    : `rgba(255, 152, 131, ${0.5 + inkProgress * 0.5})`;

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
      handleContentInteraction(newContent);
    },
    placeholder: "여기에 당신의 마음을 담아주세요...",
    enableImages: false, // 일반 편지는 이미지 비활성화
  });

  // 임시저장 훅
  const { saveState, manualSave } = useDraftManualSave({
    content,
    title,
    type: "friend", // 일반 편지로 고정
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
    if (content) {
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

      // 일반 편지 생성
      const result = await createLetter(
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
        <motion.div
          className="container mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
          <HeroBanner bannerSlides={bannerSlides} />
        </motion.div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 뒤로가기 버튼 */}
        <motion.div
          className="mb-4 sm:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-[#FF9883] border-[#FF9883] hover:bg-orange-50 px-6 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
        </motion.div>

        {/* 제목 입력 */}
        <motion.section
          className="mb-6 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
        >
          <motion.h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-700 mb-4 sm:mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            편지의 제목을 정해주세요
          </motion.h2>

          <motion.div
            className="bg-white border border-gray-300 rounded-lg p-4 sm:p-7"
            whileFocus={{ borderColor: "#FF9883", boxShadow: "0 0 0 2px rgba(255, 152, 131, 0.2)" }}
            whileHover={{ borderColor: "#FF9883" }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="내용을 입력해주세요"
              className="w-full text-base sm:text-xl text-gray-700 placeholder-gray-400 border-none outline-none"
            />
          </motion.div>

          <p className="text-gray-600 text-sm sm:text-xl mt-2 sm:mt-4">
            편지 내용을 작성한 후 AI 제목 생성 버튼을 클릭하여 제목을 자동으로
            생성할 수 있습니다.
          </p>
        </motion.section>

        {/* 내용 작성 */}
        <motion.section
          className="mb-6 sm:mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" as const }}
        >
          <motion.h2
            className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-700 mb-4 sm:mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            어떤 마음을 전하고 싶으신가요?
          </motion.h2>

          {/* 편지지 스타일 컨테이너 */}
          <motion.div
            className="w-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col"
            animate={letterPaperControls}
            whileHover={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
            transition={{ duration: 0.3 }}
          >
            {/* 에디터 툴바 (상단 고정) */}
            <div className="relative z-20 bg-white border-b">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between">
                <div className="flex-1 overflow-x-auto">
                  <EditorToolbar editor={editor} enableImages={false} />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border-t sm:border-t-0">
                  <SaveIndicator saveState={saveState} />
                  <DraftSaveButton onSave={manualSave} saveState={saveState} />
                  <DraftLoadButton onLoadDraft={handleLoadDraft} />
                </div>
              </div>
            </div>

            {/* 편지지 구멍 (바인더 효과) - 모바일에서 숨김 */}
            <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 bg-red-300 z-10 pointer-events-none"></div>
            <div className="hidden sm:block absolute left-6 top-[60px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[100px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[140px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[180px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-28 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-20 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-12 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-4 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>

            {/* 편지지 내용 영역 */}
            <div
              className="pl-4 sm:pl-16 pr-4 sm:pr-8 py-6 sm:py-12 h-[500px] sm:h-[800px] overflow-y-auto relative scrollbar-hide"
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
                  To Someone Special
                </div>

                {/* AI 제목 생성 관련 버튼들 */}
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
              </div>

              {/* 오늘의 감정 질문 - AI API 비활성화로 주석 처리
              {!content.replace(/<[^>]*>/g, "").trim() && (
                <div className="mb-6">
                  <DailyPrompt />
                </div>
              )}
              */}

              {/* Tiptap 에디터 */}
              <div className="relative z-10 mb-20">
                <EditorContent editor={editor} />
                <WritingSuggestion editor={editor} />
              </div>

              {/* 편지 마무리 */}
              <div className="mt-12 flex justify-end items-center pb-8">
                <span className="text-gray-600">
                  From. {session?.user?.name || "익명"}
                </span>
                <motion.span
                  className="ml-2 text-2xl inline-block"
                  animate={envelopeControls}
                  style={{ scale: 1 + charCount * 0.00005 }}
                >
                  💌
                </motion.span>
              </div>
            </div>

            {/* 잉크 프로그레스 바 */}
            <div className="relative h-1 bg-gray-100">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-r-full"
                style={{ backgroundColor: inkColor }}
                animate={{ width: `${inkProgress * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* 글자 수 카운터 */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.span
                  key={charCount}
                  initial={charCount > 0 ? { scale: 1.3, color: "#FF9883" } : false}
                  animate={{ scale: 1, color: "#9ca3af" }}
                  transition={{ duration: 0.3 }}
                >
                  {charCount}자
                </motion.span>
                {isDeleting && charCount > 0 && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-300"
                  >
                    ✎ 수정 중
                  </motion.span>
                )}
              </div>
              <span className="text-gray-300">잉크 {Math.round(inkProgress * 100)}%</span>
            </div>

            {/* 마일스톤 축하 */}
            <AnimatePresence>
              {milestone && (
                <motion.div
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 bg-[#FF9883] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: [0.8, 1.15, 1] }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  🎉 {milestone}자 달성!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>

        <motion.div
          className="w-full h-px bg-[#C4C4C4] mb-14"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" as const }}
          style={{ transformOrigin: "left" }}
        />

        {/* 액션 버튼 */}
        <motion.section
          className="flex justify-end space-x-4 sm:space-x-8 mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-xl border-gray-400 text-gray-600 hover:bg-gray-50 min-w-[120px] sm:min-w-[168px] h-12 sm:h-[60px]"
            >
              취소
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(255, 152, 131, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-xl bg-[#FF9883] text-white border-[#FF9883] hover:bg-orange-600 min-w-[120px] sm:min-w-[168px] h-12 sm:h-[60px]"
            >
              {isSubmitting ? "편지 생성 중..." : "편지 만들기"}
            </Button>
          </motion.div>
        </motion.section>
      </main>

      {/* URL 공유 모달 */}
      <ShareModal
        isOpen={showShareModal && !!shareData}
        onClose={handleShareModalClose}
        letterUrl={shareData?.url || ""}
        letterTitle={shareData?.title || ""}
      />
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
