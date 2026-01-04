"use client";

import { useEffect, useState, useRef } from "react";
import { adService } from "@/lib/services/adService";
import { Ad, AdPlacement } from "@/types/ad";

// SVG 아이콘 컴포넌트들
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5v14l11-7z"
    />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 9v6m4-6v6"
    />
  </svg>
);

interface AdCarouselProps {
  placement: AdPlacement;
  limit?: number;
  aspectRatio?: "16:9" | "21:9" | "4:3";
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  showDebugInfo?: boolean;
}

export default function AdCarousel({
  placement,
  limit = 3,
  aspectRatio = "16:9",
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
  showDebugInfo = false,
}: AdCarouselProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedImpression = useRef<Set<string>>(new Set());

  // 반응형 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 캐러셀 광고 데이터 로드
  useEffect(() => {
    async function fetchCarouselAds() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          placement,
          limit: limit.toString(),
          aspectRatio,
          deviceType: isMobile ? "mobile" : "desktop",
        });

        if (autoPlay !== undefined) {
          params.append("autoPlay", autoPlay.toString());
        }

        const response = await fetch(`/api/ads/carousel?${params}`);

        if (!response.ok) {
          // 백엔드 API가 없는 경우 기존 API 사용
          const adList = await adService.getDisplayableAds({
            placement,
            limit,
          });
          setAds(adList);
          if (showDebugInfo) {
            console.log(
              `🎠 [${placement}] 기존 API로 광고 로드:`,
              adList.length,
              "개"
            );
          }
          return;
        }

        const data = await response.json();

        if (data.success && data.data.ads) {
          setAds(data.data.ads);
          if (showDebugInfo) {
            console.log(
              `🎠 [${placement}] 캐러셀 광고 로드:`,
              data.data.ads.length,
              "개"
            );
            console.log("메타 정보:", data.data.meta);
          }
        } else {
          throw new Error("Failed to fetch carousel ads");
        }
      } catch (error) {
        console.error("캐러셀 광고 로드 실패:", error);
        // 폴백으로 기존 API 사용
        try {
          const adList = await adService.getDisplayableAds({
            placement,
            limit,
          });
          setAds(adList);
          if (showDebugInfo) {
            console.log(
              `🎠 [${placement}] 폴백 API로 광고 로드:`,
              adList.length,
              "개"
            );
          }
        } catch (fallbackError) {
          setError("광고를 불러오는데 실패했습니다.");
          setAds([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCarouselAds();
  }, [placement, limit, aspectRatio, autoPlay, isMobile, showDebugInfo]);

  // 자동재생 로직
  useEffect(() => {
    if (isAutoPlaying && !isPaused && ads.length > 1) {
      const currentAd = ads[currentSlide];
      const duration = currentAd?.content?.carouselDuration || autoPlayInterval;

      intervalRef.current = setTimeout(() => {
        handleSlideChange("next", "auto");
      }, duration);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, isPaused, ads, autoPlayInterval]);

  // 노출 이벤트 추적
  useEffect(() => {
    if (
      ads[currentSlide] &&
      !hasTrackedImpression.current.has(ads[currentSlide]._id)
    ) {
      hasTrackedImpression.current.add(ads[currentSlide]._id);
      trackCarouselEvent("carousel_impression", {
        currentSlide,
        totalSlides: ads.length,
        interactionType: "auto",
      });
      startTimeRef.current = Date.now();
    }
  }, [currentSlide, ads]);

  // 이벤트 추적 함수
  const trackCarouselEvent = async (
    eventType: string,
    carouselData: any,
    clickTarget?: string
  ) => {
    const currentAd = ads[currentSlide];
    if (!currentAd) return;

    try {
      await adService.trackEvent({
        eventType: eventType as any,
        adId: currentAd._id,
        adSlug: currentAd.slug,
        clickTarget,
        utm: { source: "carousel", medium: "web" },
        // @ts-ignore - 캐러셀 데이터 추가
        carouselData,
      });

      if (showDebugInfo) {
        console.log(`📊 캐러셀 이벤트 추적: ${eventType}`, carouselData);
      }
    } catch (error) {
      console.warn("캐러셀 이벤트 추적 실패:", error);
    }
  };

  const handleSlideChange = (
    direction: "next" | "prev" | "direct",
    interactionType: "auto" | "manual" = "manual",
    targetIndex?: number
  ) => {
    const viewDuration = Date.now() - startTimeRef.current;

    // 현재 슬라이드 시청 시간 추적 (1초 이상 시청한 경우만)
    if (viewDuration > 1000) {
      trackCarouselEvent("carousel_slide_change", {
        currentSlide,
        totalSlides: ads.length,
        viewDuration,
        interactionType,
        slideDirection: direction,
      });
    }

    let nextSlide;
    if (direction === "direct" && targetIndex !== undefined) {
      nextSlide = targetIndex;
    } else if (direction === "next") {
      nextSlide = (currentSlide + 1) % ads.length;
    } else {
      nextSlide = currentSlide === 0 ? ads.length - 1 : currentSlide - 1;
    }

    setCurrentSlide(nextSlide);
  };

  const handleAdClick = (ad: Ad, clickTarget: "image" | "cta") => {
    const viewDuration = Date.now() - startTimeRef.current;

    trackCarouselEvent(
      "carousel_click",
      {
        currentSlide,
        totalSlides: ads.length,
        viewDuration,
        interactionType: "manual",
      },
      clickTarget
    );

    // 외부 링크로 이동
    window.open(ad.content.targetUrl, "_blank", "noopener,noreferrer");
  };

  const toggleAutoPlay = () => {
    const newAutoPlayState = !isAutoPlaying;
    setIsAutoPlaying(newAutoPlayState);

    if (!newAutoPlayState) {
      trackCarouselEvent("carousel_autoplay_stop", {
        currentSlide,
        totalSlides: ads.length,
        interactionType: "manual",
      });
    }
  };

  const handleMouseEnter = () => {
    if (isAutoPlaying) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (isAutoPlaying) {
      setIsPaused(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gray-200 animate-pulse ${className}`}
      >
        <div
          className={`w-full ${getAspectRatioClass(aspectRatio)} bg-gray-300`}
        ></div>
      </div>
    );
  }

  // 에러 상태 (디버그 모드에서만)
  if (error && showDebugInfo) {
    return (
      <div
        className={`border border-red-300 p-4 rounded-lg bg-red-50 ${className}`}
      >
        <p className="text-red-600 text-sm">
          ❌ 캐러셀 광고 로드 실패: {error}
        </p>
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
            🎠 {placement} 위치에 노출할 캐러셀 광고가 없습니다
          </p>
        </div>
      );
    }
    return null;
  }

  const currentAd = ads[currentSlide];

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 메인 캐러셀 */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div
          className={`relative ${getAspectRatioClass(
            aspectRatio
          )} cursor-pointer`}
          style={{
            backgroundColor: currentAd.content.backgroundColor,
            backgroundImage: currentAd.content.backgroundImage
              ? `url(${currentAd.content.backgroundImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={() => handleAdClick(currentAd, "image")}
        >
          {/* 캐러셀 이미지 */}
          <img
            src={
              isMobile && (currentAd.content as any).carouselImageMobile
                ? (currentAd.content as any).carouselImageMobile
                : (currentAd.content as any).carouselImage ||
                  currentAd.content.backgroundImage
            }
            alt={currentAd.content.headline}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* 오버레이 */}
          <div
            className="absolute inset-0 bg-black group-hover:bg-black/20 transition-colors"
            style={{
              opacity: (currentAd.content as any).overlayOpacity || 0.3,
            }}
          />

          {/* 콘텐츠 */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 md:p-12">
            {/* 광고주 로고 */}
            {currentAd.advertiser.logo && (
              <img
                src={currentAd.advertiser.logo}
                alt={currentAd.advertiser.name}
                className="w-16 h-16 md:w-20 md:h-20 object-contain mb-4 bg-white/90 rounded-full p-2"
              />
            )}

            {/* 헤드라인 */}
            <h2
              className={`text-2xl md:text-4xl font-bold text-center mb-4 ${
                (currentAd.content as any).textShadow ? "drop-shadow-lg" : ""
              }`}
              style={{ color: (currentAd.content as any).textColor || "white" }}
            >
              {isMobile && (currentAd.content as any).mobileHeadline
                ? (currentAd.content as any).mobileHeadline
                : currentAd.content.headline}
            </h2>

            {/* 설명 */}
            <p
              className={`text-sm md:text-lg text-center mb-6 max-w-2xl opacity-90 ${
                (currentAd.content as any).textShadow ? "drop-shadow" : ""
              }`}
              style={{ color: (currentAd.content as any).textColor || "white" }}
            >
              {isMobile && (currentAd.content as any).mobileDescription
                ? (currentAd.content as any).mobileDescription
                : currentAd.content.description}
            </p>

            {/* CTA 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdClick(currentAd, "cta");
              }}
              className="px-6 py-3 md:px-8 md:py-4 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {currentAd.content.ctaText}
            </button>
          </div>

          {/* 광고 표시 */}
          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
            광고
          </div>
        </div>

        {/* 네비게이션 화살표 */}
        {showControls && ads.length > 1 && (
          <>
            <button
              onClick={() => handleSlideChange("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={() => handleSlideChange("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* 자동재생 컨트롤 */}
        {autoPlay && ads.length > 1 && (
          <button
            onClick={toggleAutoPlay}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
          >
            {isAutoPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 인디케이터 */}
      {showIndicators && ads.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange("direct", "manual", index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-blue-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* 광고 정보 (하단) */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span>{currentAd.advertiser.name}</span>
          {ads.length > 1 && (
            <span>
              • {currentSlide + 1} / {ads.length}
            </span>
          )}
        </div>

        {showDebugInfo && currentAd.stats && (
          <div className="flex items-center space-x-4 text-xs">
            <span>
              👁️{" "}
              {(currentAd.stats as any).carouselImpressions?.toLocaleString() ||
                currentAd.stats.impressions?.toLocaleString() ||
                0}
            </span>
            <span>
              🖱️{" "}
              {(currentAd.stats as any).carouselClicks?.toLocaleString() ||
                currentAd.stats.clicks?.toLocaleString() ||
                0}
            </span>
            <span>
              📊{" "}
              {(currentAd.stats as any).carouselCtr?.toFixed(1) ||
                currentAd.stats.ctr?.toFixed(1) ||
                0}
              %
            </span>
          </div>
        )}
      </div>

      {/* 디버그 정보 */}
      {showDebugInfo && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>현재 광고:</strong> {currentAd.name}
            </div>
            <div>
              <strong>우선순위:</strong> {currentAd.displayControl.priority}
            </div>
            <div>
              <strong>자동재생:</strong> {isAutoPlaying ? "ON" : "OFF"}
            </div>
            <div>
              <strong>총 광고:</strong> {ads.length}개
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 유틸리티 함수
function getAspectRatioClass(aspectRatio: string) {
  switch (aspectRatio) {
    case "16:9":
      return "aspect-video";
    case "21:9":
      return "aspect-[21/9]";
    case "4:3":
      return "aspect-[4/3]";
    default:
      return "aspect-video";
  }
}
