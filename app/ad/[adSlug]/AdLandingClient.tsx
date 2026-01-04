"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  trackAdImpression,
  trackAdClick,
  trackAdDwell,
} from "@/lib/analytics/ad-tracker";

interface AdData {
  _id: string;
  slug: string;
  advertiser: {
    name: string;
    logo?: string;
  };
  content: {
    headline: string;
    description: string;
    ctaText: string;
    targetUrl: string;
    backgroundImage?: string;
    backgroundColor?: string;
    theme?: string;
  };
}

interface Props {
  ad: AdData;
  letterId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export default function AdLandingClient({
  ad,
  letterId,
  utmSource,
  utmMedium,
  utmCampaign,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedImpression = useRef(false);

  // 노출 추적 (페이지 로드 시)
  useEffect(() => {
    if (!hasTrackedImpression.current) {
      trackAdImpression({
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

    // 체류 시간 추적 (페이지 이탈 시)
    const handleBeforeUnload = () => {
      const dwellTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      trackAdDwell({
        adId: ad._id,
        adSlug: ad.slug,
        dwellTime,
        letterId,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [ad, letterId, utmSource, utmMedium, utmCampaign]);

  // CTA 클릭 핸들러
  const handleCTAClick = async () => {
    setIsLoading(true);

    // 클릭 추적
    await trackAdClick({
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

    // 체류 시간도 함께 기록
    const dwellTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    trackAdDwell({
      adId: ad._id,
      adSlug: ad.slug,
      dwellTime,
      letterId,
    });

    // 광고주 사이트로 리다이렉트
    window.location.href = ad.content.targetUrl;
  };

  // 테마별 스타일
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
      case "congratulation":
        return {
          bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
          accent: "bg-indigo-500 hover:bg-indigo-600",
          text: "text-indigo-900",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          accent: "bg-primary hover:bg-primary/90",
          text: "text-gray-900",
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme.bg}`}
      style={
        ad.content.backgroundImage
          ? {
              backgroundImage: `url(${ad.content.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : ad.content.backgroundColor
          ? { backgroundColor: ad.content.backgroundColor }
          : undefined
      }
    >
      {/* 메인 카드 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 광고주 로고 */}
        {ad.advertiser.logo && (
          <div className="p-6 flex justify-center border-b">
            <Image
              src={ad.advertiser.logo}
              alt={ad.advertiser.name}
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-8 text-center">
          {/* 헤드라인 */}
          <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${theme.text}`}>
            {ad.content.headline}
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {ad.content.description}
          </p>

          {/* CTA 버튼 */}
          <button
            onClick={handleCTAClick}
            disabled={isLoading}
            className={`
              w-full py-4 px-6 rounded-xl text-white font-bold text-lg
              transition-all duration-200 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
              ${theme.accent}
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                이동 중...
              </span>
            ) : (
              <>{ad.content.ctaText} →</>
            )}
          </button>
        </div>

        {/* 광고주 정보 */}
        <div className="px-8 pb-6 text-center">
          <p className="text-sm text-gray-400">{ad.advertiser.name} 제공</p>
        </div>
      </div>

      {/* Letter 브랜딩 */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">💌 Letter Community</p>
      </div>
    </div>
  );
}
