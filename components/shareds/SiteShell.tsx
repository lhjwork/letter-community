import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

type Props = { children: ReactNode; narrow?: boolean };

/** 위아래 항공우편 띠 12px + 헤더/푸터. narrow 는 아직 v8 로 안 옮긴 내부 페이지용 기존 폭 */
export default function SiteShell({ children, narrow }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <div className="airmail h-3 w-full" aria-hidden="true" />
      <Header />
      {narrow ? (
        <div className="flex w-full flex-1 justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-[1400px] sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[70%]">{children}</div>
        </div>
      ) : (
        <div className="flex-1">{children}</div>
      )}
      <Footer />
      <div className="airmail h-3 w-full" aria-hidden="true" />
    </div>
  );
}
