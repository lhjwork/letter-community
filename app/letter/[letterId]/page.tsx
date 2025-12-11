"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

interface Letter {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  ogPreviewMessage?: string;
  ogImageUrl?: string;
  ogImageType?: "auto" | "custom";
  createdAt: string;
}

export default function LetterDetailPage() {
  const params = useParams();
  const letterId = params.letterId as string;
  const [letter, setLetter] = useState<Letter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLetter() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`);
        if (!response.ok) {
          setLetter(null);
          return;
        }
        const { data } = await response.json();
        setLetter(data);
      } catch (error) {
        console.error("Failed to fetch letter:", error);
        setLetter(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLetter();
  }, [letterId]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/letter/${letterId}`;
    navigator.clipboard.writeText(url);
    alert("링크가 클립보드에 복사되었습니다!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!letter) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>목록으로</span>
          </a>
        </div>

        {/* 편지 내용 */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-200 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              {letter.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>작성자: {letter.authorName}</span>
              <span>•</span>
              <span>
                {new Date(letter.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-md" dangerouslySetInnerHTML={{ __html: letter.content }} />

          {/* 액션 버튼들 */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
            <a href={`/letter/${letterId}/custom-og`} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
              <span>✨</span>
              <span>공유 이미지 편집</span>
            </a>
            <a
              href={`/api/og?letterId=${letterId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <span>🖼️</span>
              <span>OG 이미지 보기</span>
            </a>
          </div>
        </div>

        {/* 공유 정보 */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">이 편지 공유하기</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/letter/${letterId}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              onClick={(e) => e.currentTarget.select()}
            />
            <button onClick={handleCopyLink} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium whitespace-nowrap">
              복사
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
