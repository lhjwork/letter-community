import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t-2 border-ink px-6 pb-12 pt-8 text-[13px] text-ink-3 mobile-down:flex-col mobile-down:items-start mobile-down:gap-3.5 mobile-down:px-4 mobile-down:pb-9 mobile-down:pt-7 mobile-down:text-xs [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:text-ink-3 hover:[&_a]:text-brick">
      <span className="flex items-center gap-2">
        <Image src="/v8/logo.png" alt="" width={48} height={32} className="h-8 w-12 object-contain mobile-down:h-7 mobile-down:w-[42px]" />
        <span className="font-pen text-[26px] text-ink mobile-down:text-2xl">Letter</span>
        <span className="font-pen text-base mobile-down:text-[15px]">답장이 있는 편지 플랫폼</span>
        <a href="https://www.instagram.com/letter_251109/" target="_blank" rel="noopener noreferrer" aria-label="레터 인스타그램 (새 창)" className="ml-1 min-w-11 justify-center">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
          </svg>
        </a>
      </span>
      <div className="flex flex-wrap gap-6 mobile-down:gap-4">
        <Link href="/notices">공지사항</Link>
        <Link href="/inquiry">문의하기</Link>
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy">개인정보처리방침</Link>
      </div>
      <span>© 2026 Letter</span>
    </footer>
  );
}
