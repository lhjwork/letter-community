"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OGPreviewContent() {
  const searchParams = useSearchParams();
  const letterIdParam = searchParams.get("letterId") || "";
  const [letterId, setLetterId] = useState(letterIdParam);
  const [previewUrl, setPreviewUrl] = useState(letterIdParam ? `/letter/${letterIdParam}` : "");

  const handlePreview = () => {
    if (letterId) {
      setPreviewUrl(`/letter/${letterId}`);
    }
  };

  const ogImageUrl = letterId ? `${window.location.origin}/api/og?letterId=${letterId}` : "";
  const shareUrl = letterId ? `${window.location.origin}/letter/${letterId}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
          메신저 공유 미리보기 🔍
        </h1>

        {/* 입력 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">편지 ID 입력</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={letterId}
              onChange={(e) => setLetterId(e.target.value)}
              placeholder="예: 693a627066fb8f784253d405"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button onClick={handlePreview} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold">
              미리보기
            </button>
          </div>
        </div>

        {previewUrl && (
          <>
            {/* 카카오톡 스타일 미리보기 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💬</span>
                <span>카카오톡 미리보기</span>
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-md border border-gray-200">
                {/* 이미지 */}
                <div className="relative w-full aspect-[1.91/1] bg-gray-100">
                  <img
                    src={ogImageUrl}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='24'%3E이미지 로딩 실패%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                {/* 텍스트 정보 */}
                <div className="p-4 bg-white">
                  <div className="text-xs text-gray-500 mb-1">Letter Community</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">당신에게 도착한 편지</div>
                  <div className="text-xs text-gray-600 line-clamp-2">Letter Community에서 특별한 편지를 확인하세요</div>
                </div>
              </div>
            </div>

            {/* 페이스북/메신저 스타일 미리보기 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📘</span>
                <span>Facebook 미리보기</span>
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
                {/* 이미지 */}
                <div className="relative w-full aspect-[1.91/1] bg-gray-100">
                  <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                </div>
                {/* 텍스트 정보 */}
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs text-gray-500 uppercase mb-1">LETTER-COMMUNITY.COM</div>
                  <div className="font-semibold text-gray-900 mb-1">당신에게 도착한 편지</div>
                  <div className="text-sm text-gray-600">Letter Community에서 특별한 편지를 확인하세요</div>
                </div>
              </div>
            </div>

            {/* 트위터 스타일 미리보기 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🐦</span>
                <span>Twitter (X) 미리보기</span>
              </h2>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300 max-w-xl">
                {/* 이미지 */}
                <div className="relative w-full aspect-[2/1] bg-gray-100">
                  <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                </div>
                {/* 텍스트 정보 */}
                <div className="p-4">
                  <div className="font-semibold text-gray-900 mb-1">당신에게 도착한 편지</div>
                  <div className="text-sm text-gray-600 mb-2">Letter Community에서 특별한 편지를 확인하세요</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                    </svg>
                    <span>localhost:3000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 링크 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">공유 정보</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">공유 URL:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-gray-300 font-mono text-xs break-all">{shareUrl}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">OG 이미지 URL:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-gray-300 font-mono text-xs break-all">{ogImageUrl}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  편지 보기
                </a>
                <a href={ogImageUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm">
                  OG 이미지 보기
                </a>
              </div>
            </div>
          </>
        )}

        {/* 안내 메시지 */}
        {!previewUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-gray-700">편지 ID를 입력하고 `미리보기 버튼을 클릭하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OGPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <OGPreviewContent />
    </Suspense>
  );
}
