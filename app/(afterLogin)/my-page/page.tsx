"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { updateUser } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface Story {
  _id?: string;
  id?: string;
  type: string;
  userId: string;
  title: string;
  content: string;
  plainContent?: string;
  authorName: string;
  category: string;
  viewCount: number;
  likeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "sent", label: "보낸 편지" },
  { value: "received", label: "받은 편지" },
];

const TABS: { value: TabType; label: string }[] = [
  { value: "letters", label: "나의 편지" },
  { value: "stories", label: "나의 사연" },
];

// Figma: 512x546 패널 안 464x104 편지 카드
const cardClass =
  "block border-2 border-[#C4C4C4] rounded-xl px-5 py-4 hover:bg-[#F9F9F9] transition-colors";
const panelClass = "bg-white rounded-lg border-2 border-[#EDEDED]";
const headingClass = "text-2xl sm:text-4xl lg:text-[48px] leading-tight transition-colors";

export default function MyPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("letters");
  const [filter, setFilter] = useState<FilterType>("all");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNameInput(session?.user?.name || "");
  }, [session?.user?.name]);

  const handleSaveName = async () => {
    const name = nameInput.trim();
    if (!name || name === session?.user?.name || !session?.backendToken) return;
    setSavingName(true);
    try {
      await updateUser(session.backendToken, { name });
      await update({ name });
    } catch (e) {
      alert(e instanceof Error ? e.message : "닉네임 변경에 실패했습니다");
    } finally {
      setSavingName(false);
    }
  };

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

  // 사연 목록 가져오기 함수
  const fetchStories = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch("/api/letters/my/stories");

      if (response.ok) {
        const data = await response.json();
        setStories(data.data || []);
      } else {
        console.error("사연 목록 가져오기 실패:", response.status);
      }
    } catch (error) {
      console.error("사연 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 편지/사연 목록 가져오기 Effect
  useEffect(() => {
    if (!session) return;
    if (activeTab === "letters") {
      fetchLetters();
    } else {
      fetchStories();
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
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="w-12 h-12 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const emptyMessage = () => {
    if (activeTab === "stories") return "작성한 사연이 없습니다";
    if (filter === "sent") return "보낸 편지가 없습니다";
    if (filter === "received") return "받은 편지가 없습니다";
    return "작성한 편지가 없습니다";
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <main className="container mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[648fr_512fr] gap-6 lg:gap-[11px]">
          {/* 왼쪽: 내 프로필 */}
          <section>
            <h2
              className={`${headingClass} text-[#757575] mb-4 sm:mb-6`}
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              내 프로필
            </h2>

            <div className={`${panelClass} p-5 sm:p-6`}>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
                {/* 프로필 이미지 */}
                <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] shrink-0 mx-auto sm:mx-0">
                  <div className="w-full h-full rounded-full bg-[#C4C4C4] flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl">👤</span>
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] bg-white border-2 border-[#C4C4C4] rounded-full flex items-center justify-center text-[#757575] hover:bg-[#F9F9F9] transition-colors"
                    aria-label="프로필 사진 변경"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* 이메일 / 닉네임 / 배송정보 */}
                <div className="flex-1 flex flex-col gap-5">
                  <div
                    className="h-16 px-3 bg-[#F9F9F9] rounded-lg flex items-center text-xl text-[#757575] truncate"
                    style={{ fontFamily: "Pretendard, sans-serif" }}
                  >
                    {session?.user?.email || "이메일 없음"}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveName();
                    }}
                    className="h-16 px-6 border-2 border-[#FF9883] rounded-lg flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={20}
                      placeholder="닉네임을 입력해주세요"
                      className="flex-1 min-w-0 bg-transparent outline-none text-xl text-[#757575] placeholder-[#C4C4C4]"
                      style={{ fontFamily: "Pretendard, sans-serif" }}
                    />
                    <button
                      type="submit"
                      disabled={savingName}
                      className="shrink-0 text-[#FF7F65] disabled:opacity-40"
                      aria-label="닉네임 저장"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </form>

                  <Link
                    href="/letter-box/addresses"
                    className="h-16 px-6 border-2 border-[#C4C4C4] rounded-lg flex items-center justify-between text-xl text-[#757575] hover:bg-[#F9F9F9] transition-colors"
                    style={{ fontFamily: "Pretendard, sans-serif" }}
                  >
                    배송정보 관리
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* 연동정보 */}
              <div className="mt-8">
                <h3
                  className="text-xl font-medium text-[#424242] mb-6"
                  style={{ fontFamily: "Pretendard, sans-serif" }}
                >
                  연동정보
                </h3>
                <div className="h-[168px] bg-[#F9F9F9] rounded-lg flex items-center justify-center">
                  <p className="text-[#757575]">연동된 계정이 없습니다</p>
                </div>
              </div>
            </div>
          </section>

          {/* 오른쪽: 나의 편지 / 사연 */}
          <section>
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`${headingClass} shrink-0 ${
                      activeTab === tab.value
                        ? "text-[#757575]"
                        : "text-[#EDEDED] hover:text-[#C4C4C4]"
                    }`}
                    style={{ fontFamily: "NanumJangMiCe, cursive" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "letters" && (
                <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                  <SelectTrigger
                    className="!h-12 w-[140px] shrink-0 px-4 border-2 border-[#C4C4C4] rounded-lg bg-white text-[#757575] text-xl shadow-none data-[state=open]:border-[#FF7F65] focus-visible:border-[#FF7F65] focus-visible:ring-0 [&_svg]:size-6 [&_svg]:text-[#757575] [&_svg]:opacity-100"
                    style={{ fontFamily: "Pretendard, sans-serif" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={6}
                    className="rounded-lg border-2 border-[#C4C4C4] bg-[#FEFEFE] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                  >
                    {FILTERS.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        className="h-12 pl-4 pr-10 rounded-lg text-xl text-[#757575] cursor-pointer focus:bg-[#FFF1EE] focus:text-[#FF7F65] data-[state=checked]:text-[#FF7F65] [&_svg]:text-[#FF7F65]"
                        style={{ fontFamily: "Pretendard, sans-serif" }}
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className={`${panelClass} p-5 sm:p-6 h-[546px] overflow-y-auto`}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#FF7F65] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeTab === "letters" ? (
                filteredLetters.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLetters.map((letter) => {
                      const letterId = letter._id || letter.id;
                      return (
                        <Link key={letterId} href={`/letter/${letterId}`} className={cardClass}>
                          <h3 className="text-xl font-medium text-[#424242]">{letter.title}</h3>
                          <p className="mt-1 text-sm text-[#757575] line-clamp-1">
                            {letter.content.replace(/<[^>]*>/g, "")}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#757575] text-right">
                            <span className="text-[#FF7F65]">From.</span>
                            {filter === "sent"
                              ? letter.recipientName || "익명"
                              : letter.senderName || "익명"}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-[#C4C4C4] py-12">{emptyMessage()}</p>
                )
              ) : stories.length > 0 ? (
                <div className="space-y-4">
                  {stories.map((story) => {
                    const storyId = story._id || story.id;
                    return (
                      <Link key={storyId} href={`/letter/${storyId}`} className={cardClass}>
                        <h3 className="text-xl font-medium text-[#424242]">{story.title}</h3>
                        <p className="mt-1 text-sm text-[#757575] line-clamp-1">
                          {story.plainContent || story.content.replace(/<[^>]*>/g, "")}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#757575] text-right">
                          <span className="text-[#FF7F65]">{story.category}</span>
                          {" · "}
                          {new Date(story.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-[#C4C4C4] py-12">{emptyMessage()}</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
