"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyLetters, getMyStories, type Letter, type Story, type Pagination } from "@/lib/api";
import { HeroBanner } from "@/components/home";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };

  // Masonry height pattern: 3 sizes for visual variety
  const getCardHeight = (index: number) => {
    const pattern = [280, 360, 280, 440, 360, 280, 440, 280, 360, 280, 360, 440];
    return pattern[index % pattern.length];
  };

  // Generate horizontal line positions based on card height
  const getLinePositions = (height: number) => {
    const lines = [];
    for (let y = 48; y < height - 20; y += 48) {
      lines.push(y);
    }
    return lines;
  };

  // Calculate max text lines based on card height
  const getMaxLines = (height: number) => {
    if (height >= 440) return 10;
    if (height >= 360) return 7;
    return 4;
  };

  const renderMailboxCard = (item: { _id: string; title?: string; content?: string; authorName?: string; createdAt: string }, index: number) => {
    const cardHeight = getCardHeight(index);
    const lines = getLinePositions(cardHeight);
    const maxLines = getMaxLines(cardHeight);

    return (
      <Link href={`/letter/${item._id}`} key={item._id} className="block w-full break-inside-avoid mb-4 sm:mb-5">
        <div
          className="bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl w-full relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          style={{ height: `${cardHeight}px` }}
        >
          {/* Horizontal lines */}
          {lines.map((lineY) => (
            <div
              key={lineY}
              className="absolute left-0 right-0 h-0.5 bg-[#EDEDED]"
              style={{ top: `${lineY}px` }}
            />
          ))}

          {/* Envelope icon - top left */}
          <div className="absolute top-3.5 left-3">
            <Image src="/icons/envelope-icon.png" alt="" width={28} height={24} className="w-7 h-6" />
          </div>

          {/* Date - top right */}
          <div className="absolute top-4 right-3 sm:right-4">
            <span className="text-[16px] sm:text-[18px] text-[#424242] font-['Pretendard']">
              {formatDate(item.createdAt)}
            </span>
          </div>

          {/* Title/Content preview */}
          <div className="absolute top-14 left-4 right-4 sm:left-5 sm:right-5 bottom-14">
            <p
              className="text-[15px] sm:text-[16px] text-[#424242] leading-relaxed font-['Pretendard'] overflow-hidden"
              style={{ display: "-webkit-box", WebkitLineClamp: maxLines, WebkitBoxOrient: "vertical" }}
            >
              {item.title || (item.content ? item.content.replace(/<[^>]*>/g, "").substring(0, 200) : "")}
            </p>
          </div>

          {/* Author - bottom right */}
          <div className="absolute bottom-4 right-3 sm:right-4">
            <span className="text-[18px] sm:text-[20px] font-medium text-[#424242] font-['Pretendard']">
              {item.authorName || "익명"}
            </span>
          </div>
        </div>
      </Link>
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
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setStoryPage(1);
                }}
                className="appearance-none h-[48px] sm:h-[64px] px-4 sm:px-5 pr-10 border-2 border-[#C4C4C4] rounded-lg bg-white text-[#424242] text-base sm:text-xl cursor-pointer focus:outline-none focus:border-[#FF7F65]"
                style={{ fontFamily: "Pretendard, sans-serif" }}
              >
                <option value="">카테고리</option>
                <option value="가족">가족</option>
                <option value="사랑">사랑</option>
                <option value="우정">우정</option>
                <option value="성장">성장</option>
                <option value="위로">위로</option>
                <option value="추억">추억</option>
                <option value="감사">감사</option>
                <option value="기타">기타</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
            href={activeTab === "letters" ? "/write" : "/write?type=story"}
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
                {letters.map((letter, index) => renderMailboxCard(letter, index))}
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
                  href="/write?type=story"
                  className="inline-block px-6 py-3 bg-[#FF7F65] text-white text-lg font-semibold rounded-lg hover:bg-[#ff6b50] transition-colors"
                >
                  첫 사연 작성하기
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5">
                {stories.map((story, index) =>
                  renderMailboxCard({
                    _id: story._id,
                    title: story.title,
                    content: story.content,
                    authorName: story.authorName,
                    createdAt: story.createdAt,
                  }, index)
                )}
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
