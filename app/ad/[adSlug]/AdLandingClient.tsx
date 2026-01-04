"use client";

import { useEffect, useRef, useState } from "react";
import { adService } from "@/lib/services/adService";
import { Ad } from "@/types/ad";

interface Props {
  ad: Ad;
  letterId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export default function AdLandingClient({ ad, letterId, utm }: Props) {
  const [startTime, setStartTime] = useState<number>(0);
  const hasTrackedImpression = useRef(false);

  // 클라이언트에서만 시작 시간 설정
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // 노출 추적 (페이지 로드 시 1회)
  useEffect(() => {
    if (hasTrackedImpression.current) return;
    hasTrackedImpression.current = true;

    adService.trackEvent({
      eventType: "impression",
      adId: ad._id,
      adSlug: ad.slug,
      letterId,
      utm,
    });
  }, [ad._id, ad.slug, letterId, utm]);

  // 체류시간 추적 (페이지 이탈 시)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTime === 0) return;

      const dwellTime = Math.round((Date.now() - startTime) / 1000);

      // Beacon API로 페이지 이탈 시에도 전송 보장
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
  }, [ad._id, ad.slug, letterId, startTime]);

  // CTA 클릭 핸들러
  const handleCtaClick = async () => {
    await adService.trackEvent({
      eventType: "click",
      adId: ad._id,
      adSlug: ad.slug,
      clickTarget: "cta",
      letterId,
      utm,
    });

    // 광고주 사이트로 이동
    window.location.href = ad.content.targetUrl;
  };

  // 테마별 스타일
  const themeStyles = {
    wedding: "bg-pink-50",
    birthday: "bg-yellow-50",
    congratulation: "bg-blue-50",
    general: "bg-gray-50",
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${
        themeStyles[ad.content.theme as keyof typeof themeStyles] ||
        themeStyles.general
      }`}
      style={{
        backgroundColor: ad.content.backgroundColor,
        backgroundImage: ad.content.backgroundImage
          ? `url(${ad.content.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 광고주 로고 */}
      {ad.advertiser.logo && (
        <img
          src={ad.advertiser.logo}
          alt={ad.advertiser.name}
          className="w-24 h-24 object-contain mb-6"
        />
      )}

      {/* 헤드라인 */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 max-w-2xl">
        {ad.content.headline}
      </h1>

      {/* 설명 */}
      <p className="text-lg text-gray-600 text-center mb-8 max-w-md">
        {ad.content.description}
      </p>

      {/* CTA 버튼 */}
      <button
        onClick={handleCtaClick}
        className="px-8 py-4 bg-blue-600 text-white text-lg rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
      >
        {ad.content.ctaText}
      </button>

      {/* 광고주 정보 */}
      <p className="mt-8 text-sm text-gray-400">광고 · {ad.advertiser.name}</p>
    </div>
  );
}
