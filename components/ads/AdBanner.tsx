"use client";
import { safeHttpUrl } from "@/lib/safe-url";

import { useEffect, useState, useRef } from "react";
import { adService } from "@/lib/services/adService";
import { Ad, AdPlacement, DisplayableAdsDebug } from "@/types/ad";

interface AdBannerProps {
  placement: AdPlacement;
  limit?: number;
  theme?: string;
  className?: string;
  showDebugInfo?: boolean;
}

export default function AdBanner({
  placement,
  limit = 1,
  theme,
  className = "",
  showDebugInfo = false,
}: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DisplayableAdsDebug | null>(null);
  const hasTrackedImpression = useRef<Set<string>>(new Set());

  // 광고 데이터 로드
  useEffect(() => {
    async function fetchAds() {
      try {
        setLoading(true);
        setError(null);

        const adList = await adService.getDisplayableAds({
          placement,
          limit,
          theme,
        });
        setAds(adList);

        // 개발 환경에서 디버그 정보 조회
        if (showDebugInfo && process.env.NODE_ENV === "development") {
          const debug = await adService.getDisplayableAdsDebug(placement);
          setDebugInfo(debug);
          console.log(`🔍 [${placement}] 광고 로드:`, adList.length, "개");
        }
      } catch (error) {
        console.error("광고 로드 실패:", error);
        setError("광고를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, [placement, limit, theme, showDebugInfo]);

  // 노출 추적 (Intersection Observer)
  useEffect(() => {
    if (ads.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const adId = entry.target.getAttribute("data-ad-id");
            const adSlug = entry.target.getAttribute("data-ad-slug");

            if (adId && adSlug && !hasTrackedImpression.current.has(adId)) {
              hasTrackedImpression.current.add(adId);
              adService.trackEvent({
                eventType: "impression",
                adId,
                adSlug,
                utm: { source: "banner", medium: "web" },
              });

              if (showDebugInfo) {
                console.log(`📊 노출 추적: ${adSlug}`);
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // 모든 광고 요소 관찰
    const adElements = document.querySelectorAll(
      `[data-placement="${placement}"]`
    );
    adElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [ads, placement, showDebugInfo]);

  // 클릭 추적
  const handleAdClick = async (ad: Ad, clickTarget: string = "cta") => {
    await adService.trackEvent({
      eventType: "click",
      adId: ad._id,
      adSlug: ad.slug,
      clickTarget,
    });

    if (showDebugInfo) {
      console.log(`🖱️ 클릭 추적: ${ad.slug} (${clickTarget})`);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="h-24 bg-gray-300 rounded"></div>
      </div>
    );
  }

  // 에러 상태
  if (error && showDebugInfo) {
    return (
      <div
        className={`border border-red-300 p-4 rounded-lg bg-red-50 ${className}`}
      >
        <p className="text-red-600 text-sm">❌ {error}</p>
      </div>
    );
  }

  // 디버그 정보 표시 (개발 환경)
  if (showDebugInfo && debugInfo) {
    return (
      <div
        className={`border-2 border-yellow-400 p-4 rounded-lg bg-yellow-50 ${className}`}
      >
        <h3 className="font-bold text-yellow-800 mb-2">
          🐛 광고 디버그 정보 ({placement})
        </h3>
        <div className="text-sm space-y-1">
          <p>전체 광고: {debugInfo.totalAdsInDB}개</p>
          <p>활성 광고: {debugInfo.activeAds}개</p>
          <p>노출 설정된 광고: {debugInfo.visibleAds}개</p>
          <p>노출 가능한 광고: {debugInfo.displayableAdsCount}개</p>
          <p>필터링된 광고: {debugInfo.filteredOutAds?.length || 0}개</p>
        </div>

        {debugInfo.filteredOutAds?.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-yellow-700">
              필터링된 광고 보기
            </summary>
            <ul className="mt-1 text-xs space-y-1">
              {debugInfo.filteredOutAds.map((ad: any) => (
                <li key={ad._id} className="text-red-600">
                  <strong>{ad.name}</strong>: {ad.reason}
                </li>
              ))}
            </ul>
          </details>
        )}

        {debugInfo.displayableAds.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-green-700">
              노출 가능한 광고 보기
            </summary>
            <ul className="mt-1 text-xs space-y-1">
              {debugInfo.displayableAds.map((ad: Ad) => (
                <li key={ad._id} className="text-green-600">
                  <strong>{ad.name}</strong> (우선순위:{" "}
                  {ad.displayControl.priority})
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  }

  // 광고가 없는 경우
  if (ads.length === 0) {
    if (showDebugInfo) {
      return (
        <div
          className={`border border-gray-300 p-4 rounded-lg bg-gray-50 ${className}`}
        >
          <p className="text-gray-500 text-center text-sm">
            📭 {placement} 위치에 노출할 광고가 없습니다
          </p>
        </div>
      );
    }
    return null; // 프로덕션에서는 아무것도 표시하지 않음
  }

  // 광고 렌더링
  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad) => (
        <div
          key={ad._id}
          data-ad-id={ad._id}
          data-ad-slug={ad.slug}
          data-placement={placement}
          className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
            placement === "sidebar" ? "max-w-sm" : ""
          }`}
          style={{ backgroundColor: ad.content.backgroundColor }}
        >
          {/* 배경 이미지 */}
          {ad.content.backgroundImage && (
            <div
              className={`bg-cover bg-center relative ${
                placement === "sidebar" ? "h-24" : "h-40"
              }`}
              style={{
                backgroundImage: `url(${ad.content.backgroundImage})`,
              }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
          )}

          <div className={placement === "sidebar" ? "p-4" : "p-6"}>
            {/* 광고주 정보 */}
            <div
              className={`flex items-center gap-3 ${
                placement === "sidebar" ? "mb-3" : "mb-4"
              }`}
            >
              {ad.advertiser.logo && (
                <img
                  src={ad.advertiser.logo}
                  alt={ad.advertiser.name}
                  className={`object-contain rounded-full bg-white shadow-sm ${
                    placement === "sidebar" ? "w-8 h-8" : "w-12 h-12"
                  }`}
                />
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  광고
                </p>
                <p
                  className={`font-medium text-gray-700 ${
                    placement === "sidebar" ? "text-sm" : ""
                  }`}
                >
                  {ad.advertiser.name}
                </p>
              </div>
            </div>

            {/* 헤드라인 */}
            <h3
              className={`font-bold text-gray-800 group-hover:text-blue-600 transition-colors ${
                placement === "sidebar" ? "text-lg mb-2" : "text-xl mb-3"
              }`}
            >
              {ad.content.headline}
            </h3>

            {/* 설명 */}
            <p
              className={`text-gray-600 leading-relaxed line-clamp-3 ${
                placement === "sidebar" ? "text-xs mb-4" : "text-sm mb-6"
              }`}
            >
              {ad.content.description}
            </p>

            {/* CTA 버튼 */}
            <div className="flex items-center justify-between">
              <a
                href={safeHttpUrl(ad.content.targetUrl)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAdClick(ad, "cta")}
                className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  placement === "sidebar"
                    ? "px-4 py-2 text-xs"
                    : "px-6 py-3 text-sm"
                }`}
              >
                {ad.content.ctaText}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* 통계 정보 (개발 환경에서만) */}
              {showDebugInfo && placement !== "sidebar" && ad.stats && (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>👁️ {ad.stats.impressions.toLocaleString()}</div>
                  <div>🖱️ {ad.stats.clicks.toLocaleString()}</div>
                  <div>📊 {ad.stats.ctr.toFixed(1)}%</div>
                </div>
              )}
            </div>

            {/* 디버그 정보 */}
            {showDebugInfo && (
              <div
                className={`bg-yellow-50 border border-yellow-200 rounded-lg text-xs ${
                  placement === "sidebar" ? "mt-2 p-2" : "mt-4 p-3"
                }`}
              >
                <div
                  className={
                    placement === "sidebar"
                      ? "space-y-1"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  <div>
                    <strong>ID:</strong> {ad._id.slice(-8)}
                  </div>
                  <div>
                    <strong>우선순위:</strong> {ad.displayControl.priority}
                  </div>
                  {placement !== "sidebar" && (
                    <>
                      <div>
                        <strong>노출 위치:</strong>{" "}
                        {ad.displayControl.placements.join(", ")}
                      </div>
                      <div>
                        <strong>평균 체류:</strong>{" "}
                        {ad.stats?.avgDwellTime || 0}초
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 호버 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
