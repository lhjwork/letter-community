import { NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-8 text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-indigo-100 mb-6">
          <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">요청하신 페이지를 찾을 수 없습니다.</p>

        <div className="flex justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition">
            홈으로 돌아가기
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">임시 페이지 — 나중에 디자인/콘텐츠를 교체하세요.</p>
      </div>
    </div>
  );
};
export default NotFound;