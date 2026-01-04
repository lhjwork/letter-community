"use client";

import { useState } from "react";
import Link from "next/link";
import { generateAdQRUrl, generateQRImageUrl } from "@/lib/qrcode";

// 테스트용 광고 데이터
const testAds = [
  {
    slug: "test-wedding-promo",
    name: "웨딩 프로모션 테스트",
    theme: "wedding",
    headline: "신혼부부 특별 할인 10%!",
    description:
      "결혼을 축하합니다! 플라워카페에서 특별한 혜택을 준비했어요. 아름다운 꽃다발과 함께 행복한 시작을 응원합니다.",
    ctaText: "혜택 받으러 가기",
    advertiser: "플라워카페",
  },
  {
    slug: "test-birthday-promo",
    name: "생일 프로모션 테스트",
    theme: "birthday",
    headline: "🎂 생일 축하 특별 이벤트!",
    description:
      "소중한 분의 생일을 더욱 특별하게! 케이크 주문 시 미니 케이크를 무료로 드립니다.",
    ctaText: "이벤트 참여하기",
    advertiser: "스위트베이커리",
  },
  {
    slug: "test-general-promo",
    name: "일반 프로모션 테스트",
    theme: "general",
    headline: "Letter와 함께하는 특별한 혜택",
    description:
      "Letter Community 사용자만을 위한 특별 할인! 지금 바로 확인해보세요.",
    ctaText: "자세히 보기",
    advertiser: "Letter Partners",
  },
];

export default function AdTestPage() {
  const [selectedAd, setSelectedAd] = useState(testAds[0]);
  const [letterId, setLetterId] = useState("test-letter-123");
  const [campaign, setCampaign] = useState("test_campaign");

  const qrUrl = generateAdQRUrl(selectedAd.slug, { letterId, campaign });
  const qrImageUrl = generateQRImageUrl(qrUrl, 200);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📢 광고 시스템 테스트
        </h1>
        <p className="text-gray-600 mb-8">
          광고 랜딩 페이지와 QR 코드 생성을 테스트합니다.
        </p>

        {/* 테스트 플로우 설명 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔄 테스트 플로우</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium">광고 선택</h3>
                <p className="text-gray-600 text-sm">
                  아래에서 테스트할 광고 테마를 선택하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium">QR 코드 생성</h3>
                <p className="text-gray-600 text-sm">
                  UTM 파라미터가 포함된 QR 코드가 자동 생성됩니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium">랜딩 페이지 확인</h3>
                <p className="text-gray-600 text-sm">
                  &quot;랜딩 페이지 열기&quot; 버튼을 클릭하거나 QR을 스캔하여
                  광고 페이지를 확인하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                4
              </div>
              <div>
                <h3 className="font-medium">이벤트 추적 확인</h3>
                <p className="text-gray-600 text-sm">
                  브라우저 개발자 도구 Network 탭에서{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    /api/ad/track
                  </code>{" "}
                  요청을 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 광고 선택 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎨 광고 테마 선택</h2>
            <div className="space-y-3">
              {testAds.map((ad) => (
                <button
                  key={ad.slug}
                  onClick={() => setSelectedAd(ad)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAd.slug === ad.slug
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{ad.name}</div>
                  <div className="text-sm text-gray-500">테마: {ad.theme}</div>
                </button>
              ))}
            </div>

            {/* UTM 설정 */}
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">📊 UTM 파라미터</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Letter ID (선택)
                </label>
                <input
                  type="text"
                  value={letterId}
                  onChange={(e) => setLetterId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="연결된 편지 ID"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Campaign (선택)
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="캠페인 이름"
                />
              </div>
            </div>
          </div>

          {/* QR 코드 & 미리보기 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📱 QR 코드</h2>

            {/* QR 코드 이미지 */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white border rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImageUrl} alt="QR Code" width={200} height={200} />
              </div>
            </div>

            {/* URL 표시 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                생성된 URL
              </label>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono break-all">
                {qrUrl}
              </div>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              <Link
                href={`/test/ad/preview?slug=${selectedAd.slug}&letter=${letterId}&utm_source=qr&utm_medium=offline&utm_campaign=${campaign}`}
                className="block w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                🔗 랜딩 페이지 열기 (테스트 모드)
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrUrl);
                  alert("URL이 복사되었습니다!");
                }}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                📋 URL 복사
              </button>
            </div>
          </div>
        </div>

        {/* 선택된 광고 미리보기 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">👀 광고 미리보기</h2>
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-sm text-gray-400 mb-2">
                {selectedAd.advertiser}
              </div>
              <h3 className="text-xl font-bold mb-3">{selectedAd.headline}</h3>
              <p className="text-gray-600 mb-6">{selectedAd.description}</p>
              <div
                className={`py-3 px-6 rounded-lg text-white font-medium ${
                  selectedAd.theme === "wedding"
                    ? "bg-rose-500"
                    : selectedAd.theme === "birthday"
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
              >
                {selectedAd.ctaText} →
              </div>
            </div>
          </div>
        </div>

        {/* 추적 이벤트 설명 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📊 추적되는 이벤트</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">이벤트</th>
                  <th className="text-left py-2 px-4">시점</th>
                  <th className="text-left py-2 px-4">데이터</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">impression</td>
                  <td className="py-2 px-4">페이지 로드 시</td>
                  <td className="py-2 px-4 text-gray-600">
                    adId, adSlug, utm, device, session
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">click</td>
                  <td className="py-2 px-4">CTA 버튼 클릭 시</td>
                  <td className="py-2 px-4 text-gray-600">
                    adId, adSlug, clickTarget, utm
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">dwell</td>
                  <td className="py-2 px-4">페이지 이탈 시</td>
                  <td className="py-2 px-4 text-gray-600">
                    adId, adSlug, dwellTime (초)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
