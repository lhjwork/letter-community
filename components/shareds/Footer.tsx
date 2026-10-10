import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t-2 border-ink px-6 pb-12 pt-8 text-[13px] text-ink-3 mobile-down:flex-col mobile-down:items-start mobile-down:gap-3.5 mobile-down:px-4 mobile-down:pb-9 mobile-down:pt-7 mobile-down:text-xs [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:text-ink-3 hover:[&_a]:text-brick">
      <span className="flex items-center gap-2">
        <Image src="/v8/logo.png" alt="" width={48} height={32} className="h-8 w-12 object-contain mobile-down:h-7 mobile-down:w-[42px]" />
        <span className="font-pen text-[26px] text-ink mobile-down:text-2xl">Letter</span>
        <span className="font-pen text-base mobile-down:text-[15px]">답장이 있는 편지 플랫폼</span>
      </span>
      <div className="flex flex-wrap gap-6 mobile-down:gap-4">
        <a href="mailto:letter-community@naver.com">문의하기</a>
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy">개인정보처리방침</Link>
      </div>
      <span>© 2026 Letter</span>
    </footer>
  );
}
