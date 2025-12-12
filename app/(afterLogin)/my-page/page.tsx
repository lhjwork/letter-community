"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getMyLetters, deleteLetter, type Letter } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.backendToken) {
      fetchMyLetters();
    }
  }, [status, session, router]);

  const fetchMyLetters = async () => {
    try {
      setIsLoading(true);
      const token = session?.backendToken as string;
      const response = await getMyLetters(token);
      setLetters(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "편지를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (letterId: string) => {
    if (!confirm("정말 이 편지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = session?.backendToken as string;
      await deleteLetter(letterId, token);
      setLetters(letters.filter((letter) => letter._id !== letterId));
      alert("편지가 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "편지 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPreviewText = (htmlContent: string) => {
    // HTML 태그 제거
    const text = htmlContent.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
            마이페이지
          </h1>
          <p className="text-gray-600">
            안녕하세요, <span className="font-semibold">{session?.user?.name}</span>님
          </p>
        </div>

        {/* 내가 쓴 편지 목록 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              내가 쓴 편지 ({letters.length})
            </h2>
            <Link href="/write" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm">
              새 편지 쓰기
            </Link>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

          {letters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">아직 작성한 편지가 없습니다.</p>
              <Link href="/write" className="text-pink-500 hover:text-pink-600 font-semibold">
                첫 번째 편지를 작성해보세요 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {letters.map((letter) => (
                <div key={letter._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-pink-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/letter/${letter._id}`} className="group">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors truncate">{letter.title}</h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{getPreviewText(letter.content)}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>작성자: {letter.authorName}</span>
                        <span>•</span>
                        <span>{formatDate(letter.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/letter/${letter._id}`} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm text-center whitespace-nowrap">
                        보기
                      </Link>
                      <Link
                        href={`/letter/${letter._id}/custom-og`}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm text-center whitespace-nowrap"
                      >
                        OG 편집
                      </Link>
                      <button onClick={() => handleDelete(letter._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm whitespace-nowrap">
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 계정 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
            계정 정보
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 w-24">이름:</span>
              <span className="font-semibold">{session?.user?.name || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 w-24">이메일:</span>
              <span className="font-semibold">{session?.user?.email || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 w-24">로그인:</span>
              <span className="font-semibold capitalize">{session?.provider || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
