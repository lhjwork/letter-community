import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full mt-4 sm:mt-6 lg:mt-[26px] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-[52px] py-3 sm:py-4 lg:py-[14px] pb-4 sm:pb-6 lg:pb-[26px] rounded-2xl lg:rounded-[24px] border-2 border-[#C4C4C4]">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* 왼쪽 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4 flex-shrink-0"
        >
          <Image
            src="/icons/letter-logo.svg"
            alt="Letter Logo"
            width={88}
            height={60}
            className="w-12 h-8 sm:w-16 sm:h-11 md:w-[70px] md:h-[48px] lg:w-20 lg:h-14 xl:w-[88px] xl:h-[60px]"
            priority
          />
          <span
            className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px] text-black whitespace-nowrap"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            Letter
          </span>
        </Link>

        {/* 중간 네비게이션 - 태블릿 이상에서만 표시 */}
        <nav className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-12 xl:gap-[120px] flex-1 justify-center">
          <Link
            href="/write"
            className="text-base md:text-lg lg:text-xl xl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            사연 작성
          </Link>
          <Link
            href="/stories"
            className="text-base md:text-lg lg:text-xl xl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            사연 목록
          </Link>
          <Link
            href="/community"
            className="text-base md:text-lg lg:text-xl xl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            커뮤니티
          </Link>
        </nav>

        {/* 오른쪽 로그인 */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Link
            href="/login"
            className="text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-[32px] text-[#757575] hover:text-black transition-colors whitespace-nowrap"
            style={{ fontFamily: "NanumJangMiCe, cursive" }}
          >
            로그인
          </Link>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#757575] sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 모바일 네비게이션 - 모바일에서만 표시 */}
      <nav className="md:hidden flex items-center justify-around gap-4 mt-4 pt-4 border-t border-gray-200">
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
      </nav>
    </header>
  );
}
