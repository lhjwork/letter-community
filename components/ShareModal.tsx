"use client";

import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterUrl: string;
  letterTitle: string;
}

export default function ShareModal({ isOpen, onClose, letterUrl, letterTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(letterUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      // 폴백: 텍스트 선택
      const textArea = document.createElement("textarea");
      textArea.value = letterUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToKakao = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: letterTitle,
          description: "편지로 마음을 전하는 특별한 공간",
          imageUrl: `${window.location.origin}/api/og/letter/${letterUrl.split("/").pop()}`,
          link: {
            mobileWebUrl: letterUrl,
            webUrl: letterUrl,
          },
        },
        buttons: [
          {
            title: "편지 읽기",
            link: {
              mobileWebUrl: letterUrl,
              webUrl: letterUrl,
            },
          },
        ],
      });
    } else {
      // 카카오 SDK가 없으면 URL 복사
      copyToClipboard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💌</div>
          <h3 className="text-xl font-bold text-gray-800">편지가 완성되었습니다!</h3>
          <p className="text-sm text-gray-500 mt-1">이제 원하는 사람에게 공유해보세요</p>
        </div>

        <div className="space-y-4">
          {/* 제목 표시 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">편지 제목</p>
            <p className="font-semibold text-gray-800">{letterTitle}</p>
          </div>

          {/* 공유 링크 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-2 font-medium">공유 링크</p>
            <div className="bg-white rounded border p-2 mb-3">
              <p className="text-xs font-mono break-all text-gray-700">{letterUrl}</p>
            </div>
            <button onClick={copyToClipboard} className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
              {copied ? "복사됨! ✓" : "링크 복사하기"}
            </button>
          </div>

          {/* 공유 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={shareToKakao} className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
              <span>💬</span>
              카카오톡
            </button>
            <button onClick={copyToClipboard} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <span>📋</span>
              링크 복사
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-3 bg-pink-50 rounded-lg">
          <p className="text-xs text-pink-700 text-center">💡 이 링크를 받은 사람은 누구나 편지를 읽을 수 있습니다</p>
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-6 flex justify-center">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
