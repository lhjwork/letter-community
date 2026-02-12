"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

type TabType = "letters" | "stories";
type FilterType = "all" | "sent" | "received";

interface Letter {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  recipientName?: string;
  senderName?: string;
  createdAt: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("letters");
  const [filter, setFilter] = useState<FilterType>("all");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);

  // 편지 목록 가져오기 함수
  const fetchLetters = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch("/api/letters/my");

      if (response.ok) {
        const data = await response.json();
        setLetters(data.data || []);
      } else {
        console.error("편지 목록 가져오기 실패:", response.status);
      }
    } catch (error) {
      console.error("편지 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 편지 목록 가져오기 Effect
  useEffect(() => {
    if (activeTab === "letters" && session) {
      fetchLetters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);

  // 필터링된 편지 목록
  const filteredLetters = letters.filter((letter) => {
    if (filter === "all") return true;
    if (filter === "sent") return letter.senderName === session?.user?.name;
    if (filter === "received")
      return letter.recipientName === session?.user?.name;
    return true;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 내 프로필 */}
          <div className="lg:col-span-1">
            <h2
              className="text-4xl font-bold text-gray-600 mb-8"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              내 프로필
            </h2>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
              {/* 프로필 이미지 */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 이메일 */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-center">
                  {session?.user?.email || "이메일 없음"}
                </p>
              </div>

              {/* 닉네임 수정 */}
              <div className="mb-4 p-4 border-2 border-gray-400 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">
                  {session?.user?.name || "닉네임"}
                </span>
                <button className="text-gray-600 hover:text-gray-800">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>

              {/* 배송정보 관리 */}
              <Link
                href="/letter-box/addresses"
                className="block mb-4 p-4 border-2 border-gray-400 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-600">배송정보 관리</span>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              {/* 연동정보 */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  연동정보
                </h3>
                <div className="p-6 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    연동된 계정이 없습니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 나의 편지/사연 */}
          <div className="lg:col-span-2">
            {/* 탭과 필터 */}
            <div className="flex items-center justify-between mb-8">
              {/* 탭 */}
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("letters")}
                  className="relative"
                >
                  <h2
                    className={`text-4xl font-bold transition-colors ${
                      activeTab === "letters"
                        ? "text-gray-600"
                        : "text-gray-200"
                    }`}
                    style={{ fontFamily: "NanumJangMiCe, cursive" }}
                  >
                    나의 편지
                  </h2>
                  {activeTab === "letters" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("stories")}
                  className="relative"
                >
                  <h2
                    className={`text-4xl font-bold transition-colors ${
                      activeTab === "stories"
                        ? "text-gray-600"
                        : "text-gray-200"
                    }`}
                    style={{ fontFamily: "NanumJangMiCe, cursive" }}
                  >
                    나의 사연
                  </h2>
                  {activeTab === "stories" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-600"></div>
                  )}
                </button>
              </div>

              {/* Select 필터 - 나의 편지 탭일 때만 표시 */}
              {activeTab === "letters" && (
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="pl-4 pr-10 py-2 border-2 border-gray-400 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none"
                  >
                    <option value="all">전체</option>
                    <option value="sent">보낸 편지</option>
                    <option value="received">받은 편지</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* 콘텐츠 영역 */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
              {activeTab === "letters" ? (
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
                    </div>
                  ) : filteredLetters.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLetters.map((letter) => {
                        const letterId = letter._id || letter.id;
                        return (
                          <Link
                            key={letterId}
                            href={`/letter/${letterId}`}
                            className="block border-2 border-gray-400 rounded-xl p-5 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <h3 className="text-xl font-medium text-gray-800">
                                {letter.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {letter.content.replace(/<[^>]*>/g, "")}
                              </p>
                            </div>
                            <div className="mt-1 text-right">
                              <span className="text-sm text-gray-600">
                                <span className="text-pink-400">From.</span>
                                {filter === "sent"
                                  ? letter.recipientName || "익명"
                                  : letter.senderName || "익명"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-12">
                      {filter === "all" && "작성한 편지가 없습니다"}
                      {filter === "sent" && "보낸 편지가 없습니다"}
                      {filter === "received" && "받은 편지가 없습니다"}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-center text-gray-500 py-12">
                    나의 사연을 표시합니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
