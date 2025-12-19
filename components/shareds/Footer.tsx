import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* 왼쪽: 로고 및 연락처 */}
          <div className="flex flex-col space-y-4">
            <div className="text-3xl font-bold tracking-tight">Letter</div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <span className="font-medium text-gray-700">Contact</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <a href="mailto:letter-community@naver.com" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
                  letter-community@naver.com
                </a>
              </div>

              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">편지로 마음을 전하는 특별한 서비스</p>

              <div className="text-xs text-gray-400 pt-2">© 2024 Letter. All rights reserved</div>
            </div>
          </div>

          {/* 오른쪽: 링크들 - TODO: 페이지 기획 완료 후 주석 해제 */}
          {/* <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
            <div className="flex flex-col space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">서비스</h4>
              <Link href="/service" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:translate-x-1 transform">
                서비스소개
              </Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:translate-x-1 transform">
                회사소개
              </Link>
            </div>

            <div className="flex flex-col space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">정책</h4>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:translate-x-1 transform">
                이용약관
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:translate-x-1 transform">
                개인정보처리방침
              </Link>
            </div>
          </div> */}
        </div>

        {/* 하단 구분선 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 space-y-2 sm:space-y-0">
            <span>Made with ❤️ for meaningful connections</span>
            <span>Version 0.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
