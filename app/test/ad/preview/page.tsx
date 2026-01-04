"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { adService } from "@/lib/services/adService";

// 테스트용 광고 데이터
const testAdsData: Record<
  string,
  {
    _id: string;
    slug: string;
    advertiser: { name: string; logo?: string };
    content: {
      headline: string;
      description: string;
      ctaText: string;
      targetUrl: string;
      theme: string;
    };
  }
> = {
  "test-wedding-promo": {
    _id: "test-ad-001",
    slug: "test-wedding-promo",
    advertiser: { name: "플라워카페" },
    content: {
      headline: "신혼부부 특별 할인 10%!",
      description:
        "결혼을 축하합니다! 플라워카페에서 특별한 혜택을 준비했어요. 아름다운 꽃다발과 함께 행복한 시작을 응원합니다.",
      ctaText: "혜택 받으러 가기",
      targetUrl: "https://example.com/wedding-promo",
      theme: "wedding",
    },
  },
  "test-birthday-promo": {
    _id: "test-ad-002",
    slug: "test-birthday-promo",
    advertiser: { name: "스위트베이커리" },
    content: {
      headline: "🎂 생일 축하 특별 이벤트!",
      description:
        "소중한 분의 생일을 더욱 특별하게! 케이크 주문 시 미니 케이크를 무료로 드립니다.",
      ctaText: "이벤트 참여하기",
      targetUrl: "https://example.com/birthday-promo",
      theme: "birthday",
    },
  },
  "test-general-promo": {
    _id: "test-ad-003",
    slug: "test-general-promo",
    advertiser: { name: "Letter Partners" },
    content: {
      headline: "Letter와 함께하는 특별한 혜택",
      description:
        "Letter Community 사용자만을 위한 특별 할인! 지금 바로 확인해보세요.",
      ctaText: "자세히 보기",
      targetUrl: "https://example.com/general-promo",
      theme: "general",
    },
  },
};

function AdPreviewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "test-wedding-promo";
  const letterId = searchParams.get("letter") || undefined;
  const utmSource = searchParams.get("utm_source") || undefined;
  const utmMedium = searchParams.get("utm_medium") || undefined;
  const utmCampaign = searchParams.get("utm_campaign") || undefined;

  const ad = testAdsData[slug] || testAdsData["test-wedding-promo"];

  const [isLoading, setIsLoading] = useState(false);
  const [trackingLog, setTrackingLog] = useState<string[]>([]);
  const startTimeRef = useRef<number>(0);
  const hasTrackedImpression = useRef(false);

  // 클라이언트에서만 시작 시간 설정
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTrackingLog((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  // 노출 추적
  useEffect(() => {
    if (!hasTrackedImpression.current) {
      // setTimeout으로 감싸서 cascading render 방지
      setTimeout(() => {
        addLog(`📊 impression 이벤트 전송 - adSlug: ${ad.slug}`);
      }, 0);
      adService.trackEvent({
        eventType: "impression",
        adId: ad._id,
        adSlug: ad.slug,
        letterId,
        utm: {
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
        },
      });
      hasTrackedImpression.current = true;
    }

    const handleBeforeUnload = () => {
      const dwellTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const payload = JSON.stringify({
        eventType: "dwell",
        adId: ad._id,
        adSlug: ad.slug,
        dwellTime,
        letterId,
        timestamp: new Date().toISOString(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ads/track`,
          payload
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [ad, letterId, utmSource, utmMedium, utmCampaign]);

  const handleCTAClick = async () => {
    setIsLoading(true);
    const dwellTime = Math.floor((Date.now() - startTimeRef.current) / 1000);

    addLog(`🖱️ click 이벤트 전송 - clickTarget: cta`);
    await adService.trackEvent({
      eventType: "click",
      adId: ad._id,
      adSlug: ad.slug,
      clickTarget: "cta",
      letterId,
      utm: {
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign,
      },
    });

    addLog(`⏱️ dwell 이벤트 전송 - dwellTime: ${dwellTime}초`);
    const payload = JSON.stringify({
      eventType: "dwell",
      adId: ad._id,
      adSlug: ad.slug,
      dwellTime,
      letterId,
      timestamp: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ads/track`,
        payload
      );
    }

    // 테스트 모드에서는 실제 리다이렉트 대신 알림
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `✅ 테스트 완료!\n\n실제 환경에서는 다음 URL로 이동합니다:\n${ad.content.targetUrl}`
      );
    }, 500);
  };

  const getThemeStyles = () => {
    switch (ad.content.theme) {
      case "wedding":
        return {
          bg: "bg-gradient-to-br from-pink-50 to-rose-100",
          accent: "bg-rose-500 hover:bg-rose-600",
          text: "text-rose-900",
        };
      case "birthday":
        return {
          bg: "bg-gradient-to-br from-yellow-50 to-orange-100",
          accent: "bg-orange-500 hover:bg-orange-600",
          text: "text-orange-900",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          accent: "bg-blue-500 hover:bg-blue-600",
          text: "text-gray-900",
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="min-h-screen flex">
      {/* 광고 랜딩 페이지 */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-6 ${theme.bg}`}
      >
        {/* 테스트 모드 배너 */}
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-medium z-50">
          🧪 테스트 모드 - 실제 리다이렉트가 발생하지 않습니다
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mt-12">
          <div className="p-8 text-center">
            <div className="text-sm text-gray-400 mb-2">
              {ad.advertiser.name}
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${theme.text}`}>
              {ad.content.headline}
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {ad.content.description}
            </p>
            <button
              onClick={handleCTAClick}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 ${theme.accent}`}
            >
              {isLoading ? "처리 중..." : `${ad.content.ctaText} →`}
            </button>
          </div>
          <div className="px-8 pb-6 text-center">
            <p className="text-sm text-gray-400">{ad.advertiser.name} 제공</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">💌 Letter Community</p>
        </div>
      </div>

      {/* 디버그 패널 */}
      <div className="w-80 bg-gray-900 text-white p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">🔍 디버그 패널</h2>

        {/* UTM 정보 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            UTM 파라미터
          </h3>
          <div className="bg-gray-800 rounded p-3 text-xs font-mono space-y-1">
            <div>
              source:{" "}
              <span className="text-green-400">{utmSource || "없음"}</span>
            </div>
            <div>
              medium:{" "}
              <span className="text-green-400">{utmMedium || "없음"}</span>
            </div>
            <div>
              campaign:{" "}
              <span className="text-green-400">{utmCampaign || "없음"}</span>
            </div>
            <div>
              letter:{" "}
              <span className="text-green-400">{letterId || "없음"}</span>
            </div>
          </div>
        </div>

        {/* 광고 정보 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">광고 정보</h3>
          <div className="bg-gray-800 rounded p-3 text-xs font-mono space-y-1">
            <div>
              adId: <span className="text-blue-400">{ad._id}</span>
            </div>
            <div>
              slug: <span className="text-blue-400">{ad.slug}</span>
            </div>
            <div>
              theme: <span className="text-blue-400">{ad.content.theme}</span>
            </div>
          </div>
        </div>

        {/* 이벤트 로그 */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            이벤트 로그
          </h3>
          <div className="bg-gray-800 rounded p-3 text-xs font-mono max-h-60 overflow-y-auto">
            {trackingLog.length === 0 ? (
              <div className="text-gray-500">이벤트 대기 중...</div>
            ) : (
              trackingLog.map((log, i) => (
                <div key={i} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 네트워크 확인 안내 */}
        <div className="mt-6 p-3 bg-blue-900 rounded text-xs">
          <p className="font-medium mb-1">💡 네트워크 요청 확인</p>
          <p className="text-gray-300">
            브라우저 개발자 도구(F12) → Network 탭에서{" "}
            <code className="bg-gray-800 px-1 rounded">/api/ad/track</code>{" "}
            요청을 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <AdPreviewContent />
    </Suspense>
  );
}
