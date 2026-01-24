"use client";

import { useState, useEffect } from "react";
import { useLetterEditor } from "@/components/editor/useLetterEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@tiptap/react";
import { createStory } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import SaveIndicator from "@/components/letter/SaveIndicator";
import DraftSaveButton from "@/components/letter/DraftSaveButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Suspense } from "react";
import { getFeaturedStories, type Story } from "@/lib/api";
import { HeroBanner } from "@/components/home";

const categories = [
  {
    id: "가족",
    label: "가족",
    description: "함께 해준 가족에게 전하는 이야기",
  },
  { id: "사랑", label: "사랑", description: "사랑하는 사람에게 전하는 이야기" },
  { id: "우정", label: "우정", description: "소중한 친구에게 전하는 이야기" },
  { id: "성장", label: "성장", description: "성장의 순간을 담은 이야기" },
  { id: "위로", label: "위로", description: "위로가 필요한 순간의 이야기" },
  { id: "추억", label: "추억", description: "소중한 추억을 담은 이야기" },
  { id: "감사", label: "감사", description: "감사한 마음을 전하는 이야기" },
  { id: "기타", label: "기타", description: "다양한 이야기들" },
];

function StoryUpdateContent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("가족");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);

  // 정적 배너 데이터 (fs 모듈 사용 불가로 인한 임시 해결)
  const bannerSlides = [
    {
      id: 1,
      image: "/images/mainbanner/banner-1.png",
      alt: "배너 1",
    },
  ];

  const router = useRouter();
  const { data: session } = useSession();

  // Featured Stories 가져오기
  useEffect(() => {
    const loadFeaturedStories = async () => {
      try {
        const response = await getFeaturedStories();
        console.log("Featured Stories API Response:", response);
        setFeaturedStories(response.data || []);
      } catch (error) {
        console.error("Featured stories 로드 실패:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        // 에러가 발생해도 빈 배열로 계속 진행
        setFeaturedStories([]);
      }
    };

    loadFeaturedStories();
  }, []);

  const editor = useLetterEditor({
    content,
    onChange: (newContent) => {
      setContent(newContent);
      setHasUnsavedChanges(true);
    },
    placeholder: "어떤 이야기를 건네고 싶으신가요?",
    enableImages: true,
  });

  // 임시저장 훅
  const { saveState, manualSave } = useDraftManualSave({
    content,
    title,
    type: "story",
    category: selectedCategory,
    onSave: () => {
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
    message: "작성 중인 사연이 저장되지 않았습니다. 정말 나가시겠습니까?",
  });

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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setHasUnsavedChanges(true);
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

      const result = await createStory(
        {
          title: title.trim(),
          content: htmlContent,
          authorName: session?.user?.name || "익명",
          ogTitle: title.trim(),
          ogPreviewText,
          category: selectedCategory,
          isPublic,
          aiMetadata: {
            confidence: 1.0,
            reason: "사용자 선택",
            tags: [selectedCategory],
            classifiedAt: new Date().toISOString(),
            model: "user-selected",
          },
        },
        token,
      );

      alert(`사연이 "${selectedCategory}" 카테고리로 등록되었습니다! 💌`);

      // 성공적으로 발행되면 임시저장 상태 초기화
      setHasUnsavedChanges(false);

      // 사연 상세 페이지로 이동
      if (result?.data?._id) {
        router.push(`/letter/${result.data._id}`);
      } else {
        router.push("/stories");
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

  const handleCancel = () => {
    if (
      hasUnsavedChanges &&
      !confirm("작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?")
    ) {
      return;
    }

    router.back();
  };

  const selectedCategoryInfo = categories.find(
    (cat) => cat.id === selectedCategory,
  );

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

        {/* 카테고리 선택 */}
        <section className="mb-12">
          <h2
            className="text-5xl font-bold text-gray-700 mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            사연의 색깔을 골라주세요
          </h2>

          <div className="flex flex-wrap gap-8 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-4 rounded-lg border-2 transition-colors min-w-[100px] ${
                  selectedCategory === category.id
                    ? "bg-[#FF7F65] text-white border-[#FF7F65]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="font-semibold text-xl">{category.label}</span>
              </button>
            ))}
          </div>

          {selectedCategoryInfo && (
            <p className="text-gray-600 text-xl">
              {selectedCategoryInfo.description}
            </p>
          )}
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
            제목이 떠오르지 않아도 괜찮아요. 레터가 내용을 바탕으로 제목을
            제안해드려요.
          </p>
        </section>

        {/* 내용 작성 */}
        <section className="mb-12">
          <h2
            className="text-5xl font-bold text-gray-700 mb-8"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            어떤 이야기를 건네고 싶으신가요?
          </h2>

          {/* 편지지 스타일 컨테이너 */}
          <div className="w-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
            {/* 에디터 툴바 (상단 고정) */}
            <div className="relative z-20 bg-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <EditorToolbar editor={editor} enableImages={true} />
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                  <SaveIndicator saveState={saveState} />
                  <DraftSaveButton onSave={manualSave} saveState={saveState} />
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
                  To Letter
                </div>
              </div>

              {/* Tiptap 에디터 */}
              <div className="relative z-10 mb-20">
                <EditorContent editor={editor} />
              </div>

              {/* 편지 마무리 */}
              <div className="mt-12 flex justify-end items-center pb-8">
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
              </div>
            </div>
          </div>
        </section>

        {/* 구분선 */}
        <div className="border-t border-gray-300 mb-12"></div>

        {/* 공개 여부 선택 */}
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

        <div className="w-full h-[1px] bg-[#C4C4C4] mb-14"></div>

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
    </div>
  );
}

export default function StoryUpdatePage() {
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
      <StoryUpdateContent />
    </Suspense>
  );
}
