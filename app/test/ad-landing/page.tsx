"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdLandingTestPage() {
  const [selectedAd, setSelectedAd] = useState("test-cafe-promo");
  const [utmParams, setUtmParams] = useState({
    utm_source: "qr",
    utm_medium: "offline",
    utm_campaign: "test-campaign",
    letter: "test-letter-123",
  });

  const testAds = [
    { slug: "test-cafe-promo", name: "카페 블루밍 프로모션" },
    { slug: "test-bookstore-promo", name: "책방 오늘 프로모션" },
    { slug: "test-flower-promo", name: "플라워샵 봄 프로모션" },
  ];

  const generateTestUrl = () => {
    const params = new URLSearchParams();
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/ad/${selectedAd}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">광고 랜딩 페이지 테스트</h1>

        {/* 광고 선택 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트할 광고 선택</h2>
          <div className="space-y-2">
            {testAds.map((ad) => (
              <label key={ad.slug} className="flex items-center">
                <input
                  type="radio"
                  name="ad"
                  value={ad.slug}
                  checked={selectedAd === ad.slug}
                  onChange={(e) => setSelectedAd(e.target.value)}
                  className="mr-2"
                />
                {ad.name}
              </label>
            ))}
          </div>
        </div>

        {/* UTM 파라미터 설정 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">UTM 파라미터 설정</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                UTM Source
              </label>
              <input
                type="text"
                value={utmParams.utm_source}
                onChange={(e) =>
                  setUtmParams({ ...utmParams, utm_source: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="qr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                UTM Medium
              </label>
              <input
                type="text"
                value={utmParams.utm_medium}
                onChange={(e) =>
                  setUtmParams({ ...utmParams, utm_medium: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="offline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                UTM Campaign
              </label>
              <input
                type="text"
                value={utmParams.utm_campaign}
                onChange={(e) =>
                  setUtmParams({ ...utmParams, utm_campaign: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="test-campaign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Letter ID
              </label>
              <input
                type="text"
                value={utmParams.letter}
                onChange={(e) =>
                  setUtmParams({ ...utmParams, letter: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="test-letter-123"
              />
            </div>
          </div>
        </div>

        {/* 생성된 URL */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">생성된 테스트 URL</h2>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
            {generateTestUrl()}
          </div>
        </div>

        {/* 테스트 버튼 */}
        <div className="flex gap-4">
          <Link
            href={generateTestUrl()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            광고 랜딩 페이지 테스트
          </Link>
          <Link
            href="/test/ad"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            QR 코드 테스트로 이동
          </Link>
        </div>

        {/* 설명 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">테스트 방법:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>위에서 테스트할 광고를 선택합니다</li>
            <li>UTM 파라미터를 설정합니다 (QR 접근 판별용)</li>
            <li>"광고 랜딩 페이지 테스트" 버튼을 클릭합니다</li>
            <li>개발자 도구 콘솔에서 이벤트 추적 로그를 확인합니다</li>
            <li>CTA 버튼 클릭 시 외부 사이트로 이동하는지 확인합니다</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
