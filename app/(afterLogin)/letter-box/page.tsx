"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyLetters, getMyStories, type Letter, type Story, type Pagination } from "@/lib/api";
import { HeroBanner } from "@/components/home";
import MailCard from "@/components/shareds/MailCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["카테고리", "가족", "사랑", "우정", "성장", "위로", "추억", "감사", "기타"];

function MailboxContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.backendToken;

  const [activeTab, setActiveTab] = useState<"letters" | "stories">("letters");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");

  // Letters state
  const [letters, setLetters] = useState<Letter[]>([]);
  const [letterPagination, setLetterPagination] = useState<Pagination | null>(null);
  const [isLettersLoading, setIsLettersLoading] = useState(true);
  const [letterPage, setLetterPage] = useState(1);

  // Stories state
  const [stories, setStories] = useState<Story[]>([]);
  const [storyPagination, setStoryPagination] = useState<Pagination | null>(null);
  const [isStoriesLoading, setIsStoriesLoading] = useState(true);
  const [storyPage, setStoryPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  // Banner data
  const bannerSlides = [
    { id: 1, image: "/images/mainbanner/banner-1.png", alt: "배너 1" },
  ];

  // Fetch letters
  const fetchLetters = useCallback(async (page: number) => {
    if (!token) return;
    setIsLettersLoading(true);
    try {
      const response = await getMyLetters(token, { page, limit: ITEMS_PER_PAGE });
      setLetters(response.data);
      setLetterPagination(response.pagination);
    } catch (error) {
      console.error("편지 목록 로드 실패:", error);
    } finally {
      setIsLettersLoading(false);
    }
  }, [token]);

  // Fetch stories
  const fetchStories = useCallback(async (page: number, search?: string, cat?: string) => {
    if (!token) return;
    setIsStoriesLoading(true);
    try {
      const response = await getMyStories(token, {
        page,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        category: cat || undefined,
      });
      setStories(response.data);
      setStoryPagination(response.pagination);
    } catch (error) {
      console.error("사연 목록 로드 실패:", error);
    } finally {
      setIsStoriesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchLetters(letterPage);
    }
  }, [token, letterPage, fetchLetters]);

  useEffect(() => {
    if (token) {
      fetchStories(storyPage, searchQuery, category);
    }
  }, [token, storyPage, searchQuery, category, fetchStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "stories") {
      setStoryPage(1);
      fetchStories(1, searchQuery, category);
    }
  };

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="w-12 h-12 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPagination = activeTab === "letters" ? letterPagination : storyPagination;
  const currentPage = activeTab === "letters" ? letterPage : storyPage;
  const setCurrentPage = activeTab === "letters" ? setLetterPage : setStoryPage;

  const renderPagination = () => {
    if (!currentPagination || currentPagination.totalPages <= 1) return null;
    const { totalPages } = currentPagination;

    // Calculate visible page range
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EDEDED] hover:bg-[#ddd] disabled:opacity-40 transition-colors"
        >
          <Image src="/icons/arrow-left.svg" alt="이전" width={24} height={24} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-colors ${
              page === currentPage
                ? "bg-[#FF7F65] text-white"
                : "text-[#757575] hover:bg-[#EDEDED]"
            }`}
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FF7F65] hover:bg-[#ff6b50] disabled:opacity-40 transition-colors"
        >
          <Image src="/icons/arrow-right.svg" alt="다음" width={24} height={24} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      {/* Banner */}
      {bannerSlides.length > 0 && (
        <div className="container mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-12">
          <HeroBanner bannerSlides={bannerSlides} />
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-8 lg:px-20 pb-16">
        {/* Tabs */}
        <div className="flex gap-6 sm:gap-10 mb-8 sm:mb-12">
          <button
            onClick={() => setActiveTab("letters")}
            className={`text-2xl sm:text-4xl lg:text-[48px] transition-colors ${
              activeTab === "letters" ? "text-[#757575]" : "text-[#EDEDED] hover:text-[#C4C4C4]"
            }`}
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            작성된 편지
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`text-2xl sm:text-4xl lg:text-[48px] transition-colors ${
              activeTab === "stories" ? "text-[#757575]" : "text-[#EDEDED] hover:text-[#C4C4C4]"
            }`}
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            사연 목록
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          {/* Category dropdown - only for stories tab */}
          {activeTab === "stories" && (
            <Select
              value={category || "all"}
              onValueChange={(v) => {
                setCategory(v === "all" ? "" : v);
                setStoryPage(1);
              }}
            >
              <SelectTrigger
                className="!h-[48px] sm:!h-[64px] min-w-[140px] sm:min-w-[160px] pl-4 sm:pl-5 pr-3 sm:pr-4 border-2 border-[#C4C4C4] rounded-lg bg-white text-[#424242] text-base sm:text-xl shadow-none data-[placeholder]:text-[#424242] data-[state=open]:border-[#FF7F65] focus-visible:border-[#FF7F65] focus-visible:ring-0 [&_svg]:size-5 [&_svg]:text-[#757575] [&_svg]:opacity-100"
                style={{ fontFamily: "Pretendard, sans-serif" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={6}
                className="rounded-xl border-2 border-[#FFD1C7] bg-white shadow-[0_8px_24px_rgba(255,152,131,0.18)]"
              >
                {CATEGORIES.map((c) => (
                  <SelectItem
                    key={c}
                    value={c === "카테고리" ? "all" : c}
                    className="h-11 sm:h-12 pl-4 pr-10 rounded-lg text-base sm:text-lg text-[#424242] cursor-pointer focus:bg-[#FFF1EE] focus:text-[#FF7F65] data-[state=checked]:text-[#FF7F65] [&_svg]:text-[#FF7F65]"
                    style={{ fontFamily: "Pretendard, sans-serif" }}
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Search field */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[360px]">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4C4C4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[48px] sm:h-[64px] pl-12 pr-4 border-2 border-[#C4C4C4] rounded-lg text-base sm:text-xl text-[#424242] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF7F65]"
                style={{ fontFamily: "Pretendard, sans-serif" }}
              />
            </div>
          </form>

          {/* Action button */}
          <Link
            href={activeTab === "letters" ? "/write" : "/story-update"}
            className="h-[48px] sm:h-[64px] px-5 sm:px-6 border-2 border-[#C4C4C4] rounded-lg text-base sm:text-xl font-medium text-[#424242] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            {activeTab === "letters" ? "편지 작성" : "사연 작성"}
          </Link>
        </div>

        {/* Content */}
        {activeTab === "letters" ? (
          <>
            {isLettersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : letters.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-[#C4C4C4] mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
                  아직 작성한 편지가 없습니다
                </p>
                <Link
                  href="/write"
                  className="inline-block px-6 py-3 bg-[#FF7F65] text-white text-lg font-semibold rounded-lg hover:bg-[#ff6b50] transition-colors"
                >
                  첫 편지 쓰기
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5">
                {letters.map((letter, index) => (
                  <MailCard key={letter._id} item={letter} index={index} />
                ))}
              </div>
            )}
            {renderPagination()}
          </>
        ) : (
          <>
            {isStoriesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-[#C4C4C4] mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
                  아직 작성한 사연이 없습니다
                </p>
                <Link
                  href="/story-update"
                  className="inline-block px-6 py-3 bg-[#FF7F65] text-white text-lg font-semibold rounded-lg hover:bg-[#ff6b50] transition-colors"
                >
                  첫 사연 작성하기
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5">
                {stories.map((story, index) => (
                  <MailCard key={story._id} item={story} index={index} />
                ))}
              </div>
            )}
            {renderPagination()}
          </>
        )}
      </main>
    </div>
  );
}

export default function MailboxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
          <div className="w-12 h-12 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MailboxContent />
    </Suspense>
  );
}
