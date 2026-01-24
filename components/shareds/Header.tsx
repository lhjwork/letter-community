"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import LoginDialog from "./LoginDialog";

export default function Header() {
  const { data: session, status } = useSession();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLoginClick = () => {
    if (status === "authenticated") {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsLoginDialogOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="w-full mt-4 sm:mt-6 xxl:mt-[26px] px-3 sm:px-6 md:px-8 xxl:px-[52px] py-3 sm:py-4 xxl:py-[14px] pb-4 sm:pb-6 xxl:pb-[26px] rounded-2xl xxl:rounded-[24px] border-2 border-[#C4C4C4]">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* 왼쪽 로고 */}
          <Link
            href={status === "authenticated" ? "/home" : "/"}
            className="flex items-center gap-2 sm:gap-3 xxl:gap-4 shrink-0"
          >
            <Image
              src="/icons/letter-logo.svg"
              alt="Letter Logo"
              width={88}
              height={60}
              className="w-12 h-8 sm:w-16 sm:h-11 md:w-[70px] md:h-[48px] xxl:w-[88px] xxl:h-[60px]"
              priority
            />
            <span
              className="text-2xl sm:text-3xl md:text-[32px] xxl:text-[40px] text-black whitespace-nowrap"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              Letter
            </span>
          </Link>

          {/* 중간 네비게이션 - 태블릿 이상에서만 표시 */}
          <nav className="hidden md:flex items-center gap-4 md:gap-6 xxl:gap-[120px] flex-1 justify-center">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/write"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  편지 쓰기
                </Link>
                <Link
                  href="/story-update"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  사연 작성
                </Link>
                <Link
                  href="/my-page"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  내 편지함
                </Link>
                <Link
                  href="/stories"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  사연 목록
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/write"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  사연 작성
                </Link>
                <Link
                  href="/stories"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  사연 목록
                </Link>
                <Link
                  href="/community"
                  className="text-base md:text-xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                  style={{ fontFamily: "NanumJangMiCe, cursive" }}
                >
                  커뮤니티
                </Link>
              </>
            )}
          </nav>

          {/* 오른쪽 로그인/사용자 메뉴 */}
          <div className="relative flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-1 sm:gap-2 cursor-pointer"
            >
              <span
                className="text-lg sm:text-xl md:text-2xl xxl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                {status === "authenticated" && session?.user?.name
                  ? session.user.name
                  : "로그인"}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#757575] sm:w-5 sm:h-5 md:w-5 md:h-5"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 사용자 메뉴 드롭다운 */}
            {isUserMenuOpen && status === "authenticated" && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    {session?.user?.email || ""}
                  </p>
                </div>
                <Link
                  href="/home"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  홈
                </Link>
                <Link
                  href="/my-page"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 네비게이션 - 모바일에서만 표시 */}
        <nav className="md:hidden flex items-center justify-around gap-4 mt-4 pt-4 border-t border-gray-200">
          {status === "authenticated" ? (
            <>
              <Link
                href="/write"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                편지 쓰기
              </Link>
              <Link
                href="/my-page"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                내 편지함
              </Link>
              <Link
                href="/stories"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                사연 목록
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/write"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                사연 작성
              </Link>
              <Link
                href="/stories"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                사연 목록
              </Link>
              <Link
                href="/community"
                className="text-base text-[#757575] hover:text-black transition-colors"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                커뮤니티
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* 로그인 다이얼로그 */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />
    </>
  );
}
