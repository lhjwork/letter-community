"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

          {/* 오른쪽: 나의 편지 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-4xl font-bold text-gray-600"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                나의 편지
              </h2>
              <Link
                href="/letter-box"
                className="px-6 py-2 border-2 border-gray-400 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                전체보기
              </Link>
            </div>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 min-h-[500px]">
              <p className="text-center text-gray-500 py-12">
                편지함으로 이동하여 편지를 확인하세요
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
