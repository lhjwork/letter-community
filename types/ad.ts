export interface Ad {
  _id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "paused" | "expired";
  advertiser: {
    name: string;
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  content: {
    headline: string;
    description: string;
    ctaText: string;
    targetUrl: string;
    backgroundImage?: string;
    backgroundColor?: string;
    theme?: "wedding" | "birthday" | "congratulation" | "general";

    // 캐러셀 전용 필드
    carouselImage?: string; // 캐러셀용 고해상도 이미지
    carouselImageMobile?: string; // 모바일용 캐러셀 이미지
    carouselPriority?: number; // 캐러셀 내 순서
    carouselAutoPlay?: boolean; // 자동 재생 허용 여부
    carouselDuration?: number; // 노출 시간 (밀리초)

    // 시각적 개선
    overlayOpacity?: number; // 오버레이 투명도 (0-1)
    textColor?: string; // 텍스트 색상
    textShadow?: boolean; // 텍스트 그림자 사용 여부

    // 반응형 지원
    mobileHeadline?: string; // 모바일용 짧은 헤드라인
    mobileDescription?: string; // 모바일용 짧은 설명
  };
  campaign: {
    name?: string;
    startDate: string;
    endDate: string;
    budget?: number;
    targetImpressions?: number;
    targetClicks?: number;
  };
  displayControl: {
    isVisible: boolean;
    placements: AdPlacement[];
    priority: number;
    maxDailyImpressions?: number;
    maxTotalImpressions?: number;

    // 캐러셀 전용 설정
    carouselEnabled?: boolean; // 캐러셀 노출 허용 여부
    carouselPlacements?: string[]; // 캐러셀 노출 위치
    maxCarouselImpressions?: number; // 캐러셀 최대 노출 횟수
    carouselSchedule?: {
      // 캐러셀 노출 시간대
      startHour?: number; // 시작 시간 (0-23)
      endHour?: number; // 종료 시간 (0-23)
      timezone?: string; // 시간대
    };

    targetAudience?: {
      ageRange?: { min: number; max: number };
      gender?: "male" | "female" | "all";
      regions?: string[];
    };
    schedule?: {
      startTime?: string;
      endTime?: string;
      daysOfWeek?: number[];
    };
  };
  stats: {
    impressions: number;
    clicks: number;
    ctr: number;
    uniqueVisitors: number;
    avgDwellTime: number;

    // 캐러셀 전용 통계
    carouselImpressions?: number; // 캐러셀 노출 횟수
    carouselClicks?: number; // 캐러셀 클릭 횟수
    carouselCtr?: number; // 캐러셀 CTR
    carouselAvgViewTime?: number; // 캐러셀 평균 시청 시간
    carouselSlideChanges?: number; // 슬라이드 변경 횟수
    carouselAutoPlayStops?: number; // 자동재생 중단 횟수
  };
  linkedLetters: any[];
  createdAt: string;
  updatedAt: string;
}

export type AdPlacement = "landing" | "banner" | "sidebar" | "footer" | "popup";
export type AdEventType =
  | "impression"
  | "click"
  | "dwell"
  | "carousel_impression"
  | "carousel_click"
  | "carousel_slide_change"
  | "carousel_autoplay_stop"
  | "carousel_complete_view";

export interface AdDebugInfo {
  ad: {
    _id: string;
    name: string;
    slug: string;
    status: string;
  };
  displayStatus: {
    isDisplayable: boolean;
    reasons: Array<{
      check: string;
      passed: boolean;
      value: any;
      startDate?: string;
      endDate?: string;
      currentTime?: string;
    }>;
  };
}

export interface DisplayableAdsDebug {
  displayableAds: Ad[];
  filteredOutAds: Array<{
    _id: string;
    name: string;
    slug: string;
    reason: string;
  }>;
  totalAdsInDB: number;
  activeAds: number;
  visibleAds: number;
  displayableAdsCount: number;
}
