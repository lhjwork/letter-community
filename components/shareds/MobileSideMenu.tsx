"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function MobileSideMenu({
  isOpen,
  onClose,
  onLoginClick,
}: MobileSideMenuProps) {
  const { status } = useSession();

  // body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    await signOut({ callbackUrl: "/" });
  };

  const handleMenuClick = () => {
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 사이드 메뉴 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[209px] bg-[#FEFEFE] border-l border-[#EDEDED] z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-[47px] right-[17px] w-6 h-6 cursor-pointer"
        >
          <Image
            src="/icons/mobile/close-x.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>

        {/* 서비스 메뉴 섹션 */}
        <div className="pt-[108px] px-6">
          <p className="text-[#FF7F65] text-base font-semibold mb-[32px]">
            서비스 메뉴
          </p>

          <nav className="flex flex-col gap-[28px]">
            {status === "authenticated" ? (
              <Link
                href="/write"
                onClick={handleMenuClick}
                className="flex items-center gap-2"
              >
                <Image
                  src="/icons/mobile/ink-highlighter.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  편지 쓰기
                </span>
              </Link>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  src="/icons/mobile/ink-highlighter.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  편지 쓰기
                </span>
              </button>
            )}

            {status === "authenticated" ? (
              <Link
                href="/story-update"
                onClick={handleMenuClick}
                className="flex items-center gap-2"
              >
                <Image
                  src="/icons/mobile/featured-play-list.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  사연 작성
                </span>
              </Link>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  src="/icons/mobile/featured-play-list.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  사연 작성
                </span>
              </button>
            )}

            {status === "authenticated" ? (
              <Link
                href="/letter-box"
                onClick={handleMenuClick}
                className="flex items-center gap-2"
              >
                <Image
                  src="/icons/mobile/forum.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  우편함
                </span>
              </Link>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  src="/icons/mobile/forum.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  우편함
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* 이용자 섹션 */}
        <div className="px-6 mt-[32px]">
          <p className="text-[#FF7F65] text-base font-semibold mb-[32px]">
            이용자
          </p>

          <nav className="flex flex-col gap-[28px]">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/my-page"
                  onClick={handleMenuClick}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/icons/mobile/person.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="text-[#757575] text-base font-medium">
                    마이페이지
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Image
                    src="/icons/mobile/logout.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="text-[#757575] text-base font-medium">
                    로그아웃
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  src="/icons/mobile/person.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="text-[#757575] text-base font-medium">
                  로그인
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
