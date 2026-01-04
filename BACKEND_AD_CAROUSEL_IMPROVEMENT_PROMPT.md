# 백엔드 광고 시스템 개선 프롬프트 - 캐러셀 지원

## 🎯 개선 목표

기존 텍스트 기반 광고 배너를 **이미지 중심의 캐러셀 광고**로 개선하여 사용자 경험과 광고 효과를 극대화합니다.

## 📋 현재 상황

- 프론트엔드에서 캐러셀 형태의 광고 컴포넌트 구현 완료
- 기존 API 구조는 유지하되, 광고 데이터 구조 개선 필요
- 캐러셀 전용 이벤트 추적 및 통계 기능 추가 필요

## 🔧 백엔드 개선 사항

### 1. 광고 데이터 모델 확장

#### A. 캐러셀 전용 필드 추가

```javascript
// Ad 스키마에 추가할 필드들
{
  content: {
    // 기존 필드들...

    // 캐러셀 전용 필드
    carouselImage: String,           // 캐러셀용 고해상도 이미지 (1920x1080 권장)
    carouselImageMobile: String,     // 모바일용 캐러셀 이미지 (1080x1080 권장)
    carouselPriority: Number,        // 캐러셀 내 순서 (높을수록 먼저 표시)
    carouselAutoPlay: Boolean,       // 자동 재생 허용 여부
    carouselDuration: Number,        // 노출 시간 (밀리초, 기본값: 5000)

    // 시각적 개선
    overlayOpacity: Number,          // 오버레이 투명도 (0-1, 기본값: 0.3)
    textColor: String,               // 텍스트 색상 (기본값: "white")
    textShadow: Boolean,             // 텍스트 그림자 사용 여부

    // 반응형 지원
    mobileHeadline: String,          // 모바일용 짧은 헤드라인
    mobileDescription: String,       // 모바일용 짧은 설명
  },

  displayControl: {
    // 기존 필드들...

    // 캐러셀 전용 설정
    carouselEnabled: Boolean,        // 캐러셀 노출 허용 여부
    carouselPlacements: [String],    // 캐러셀 노출 위치 ["home", "stories", "letters"]
    maxCarouselImpressions: Number,  // 캐러셀 최대 노출 횟수
    carouselSchedule: {              // 캐러셀 노출 시간대
      startHour: Number,             // 시작 시간 (0-23)
      endHour: Number,               // 종료 시간 (0-23)
      timezone: String,              // 시간대 (기본값: "Asia/Seoul")
    }
  },

  stats: {
    // 기존 필드들...

    // 캐러셀 전용 통계
    carouselImpressions: Number,     // 캐러셀 노출 횟수
    carouselClicks: Number,          // 캐러셀 클릭 횟수
    carouselCtr: Number,             // 캐러셀 CTR
    carouselAvgViewTime: Number,     // 캐러셀 평균 시청 시간
    carouselSlideChanges: Number,    // 슬라이드 변경 횟수 (사용자 액션)
    carouselAutoPlayStops: Number,   // 자동재생 중단 횟수
  }
}
```

### 2. API 엔드포인트 개선

#### A. 캐러셀 전용 광고 조회 API

```javascript
// GET /api/ads/carousel
// 캐러셀에 최적화된 광고 목록 반환

// 쿼리 파라미터
{
  placement: String,        // "home", "stories", "letters"
  limit: Number,           // 캐러셀에 표시할 광고 수 (기본값: 3, 최대: 5)
  aspectRatio: String,     // "16:9", "21:9", "4:3" (기본값: "16:9")
  deviceType: String,      // "mobile", "tablet", "desktop"
  autoPlay: Boolean,       // 자동재생 지원 광고만 필터링
}

// 응답 구조
{
  success: true,
  data: {
    ads: [
      {
        _id: "...",
        name: "...",
        slug: "...",
        advertiser: { ... },
        content: {
          headline: "...",
          description: "...",
          ctaText: "...",
          targetUrl: "...",

          // 캐러셀 전용 데이터
          carouselImage: "https://cdn.example.com/carousel/ad1-1920x1080.jpg",
          carouselImageMobile: "https://cdn.example.com/carousel/ad1-mobile-1080x1080.jpg",
          carouselPriority: 90,
          carouselDuration: 6000,
          overlayOpacity: 0.4,
          textColor: "white",
          textShadow: true,

          // 반응형 텍스트
          mobileHeadline: "짧은 헤드라인",
          mobileDescription: "짧은 설명",
        },
        displayControl: { ... },
        stats: { ... }
      }
    ],
    meta: {
      totalAds: 15,
      carouselAds: 8,
      filteredAds: 3,
      recommendedDuration: 5000,  // 권장 자동재생 간격
      aspectRatio: "16:9",
      deviceType: "desktop"
    }
  }
}
```

#### B. 캐러셀 이벤트 추적 API 개선

```javascript
// POST /api/ads/track
// 기존 이벤트 타입에 캐러셀 전용 이벤트 추가

// 새로운 이벤트 타입들
{
  eventType: "carousel_impression",    // 캐러셀 슬라이드 노출
  eventType: "carousel_click",         // 캐러셀 클릭 (이미지 또는 CTA)
  eventType: "carousel_slide_change",  // 슬라이드 변경 (사용자 액션)
  eventType: "carousel_autoplay_stop", // 자동재생 중단
  eventType: "carousel_complete_view", // 전체 캐러셀 시청 완료

  // 캐러셀 전용 추가 데이터
  carouselData: {
    currentSlide: Number,      // 현재 슬라이드 인덱스 (0부터 시작)
    totalSlides: Number,       // 전체 슬라이드 수
    viewDuration: Number,      // 해당 슬라이드 시청 시간 (밀리초)
    interactionType: String,   // "auto", "manual", "hover_pause"
    slideDirection: String,    // "next", "prev", "direct" (직접 인디케이터 클릭)
  }
}
```

### 3. 관리자 인터페이스 개선

#### A. 캐러셀 광고 생성/편집 폼

```javascript
// 관리자 페이지에 추가할 필드들

// 이미지 업로드 섹션
{
  carouselImage: {
    type: "file",
    accept: "image/*",
    maxSize: "5MB",
    recommendedSize: "1920x1080",
    description: "캐러셀용 고해상도 이미지 (16:9 비율 권장)"
  },

  carouselImageMobile: {
    type: "file",
    accept: "image/*",
    maxSize: "3MB",
    recommendedSize: "1080x1080",
    description: "모바일용 캐러셀 이미지 (1:1 비율 권장)"
  }
}

// 캐러셀 설정 섹션
{
  carouselEnabled: {
    type: "checkbox",
    label: "캐러셀 노출 허용",
    default: true
  },

  carouselPriority: {
    type: "number",
    label: "캐러셀 우선순위",
    min: 1,
    max: 100,
    default: 50,
    description: "높을수록 먼저 표시됩니다"
  },

  carouselDuration: {
    type: "number",
    label: "노출 시간 (초)",
    min: 3,
    max: 10,
    default: 5,
    description: "자동재생 시 각 슬라이드 노출 시간"
  },

  carouselPlacements: {
    type: "multiselect",
    label: "캐러셀 노출 위치",
    options: [
      { value: "home", label: "홈페이지" },
      { value: "stories", label: "스토리 목록" },
      { value: "letters", label: "편지 상세" }
    ]
  }
}

// 디자인 커스터마이징 섹션
{
  overlayOpacity: {
    type: "range",
    label: "오버레이 투명도",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.3
  },

  textColor: {
    type: "color",
    label: "텍스트 색상",
    default: "#ffffff"
  },

  textShadow: {
    type: "checkbox",
    label: "텍스트 그림자 사용",
    default: true
  }
}
```

#### B. 캐러셀 미리보기 기능

```javascript
// 관리자 페이지에 캐러셀 미리보기 컴포넌트 추가
{
  preview: {
    desktop: "데스크톱 미리보기 (1920x1080)",
    mobile: "모바일 미리보기 (375x667)",
    aspectRatios: ["16:9", "21:9", "4:3"],
    autoPlay: true,
    showStats: true
  }
}
```

### 4. 통계 및 분석 개선

#### A. 캐러셀 전용 대시보드

```javascript
// GET /api/ads/analytics/carousel
{
  success: true,
  data: {
    overview: {
      totalCarouselAds: 12,
      activeCarouselAds: 8,
      totalImpressions: 45230,
      totalClicks: 1876,
      averageCtr: 4.14,
      averageViewTime: 3.2,  // 초
    },

    topPerforming: [
      {
        adId: "...",
        name: "마비스 카페 캐러셀",
        impressions: 12450,
        clicks: 567,
        ctr: 4.55,
        avgViewTime: 4.1,
        slideCompletionRate: 78.5  // 끝까지 본 비율
      }
    ],

    placements: {
      home: { impressions: 25000, clicks: 1200, ctr: 4.8 },
      stories: { impressions: 15000, clicks: 450, ctr: 3.0 },
      letters: { impressions: 5230, clicks: 226, ctr: 4.3 }
    },

    userBehavior: {
      autoPlayCompletionRate: 65.2,    // 자동재생 완주율
      manualSlideChangeRate: 23.8,     // 수동 슬라이드 변경율
      averageSlidesViewed: 2.3,        // 평균 시청 슬라이드 수
      bounceRate: 12.5                 // 첫 슬라이드에서 이탈율
    }
  }
}
```

### 5. 성능 최적화

#### A. 이미지 최적화

```javascript
// 이미지 처리 파이프라인
{
  upload: {
    formats: ["webp", "jpg", "png"],
    quality: {
      webp: 85,
      jpg: 90
    },
    sizes: {
      carousel: "1920x1080",
      carouselMobile: "1080x1080",
      thumbnail: "400x225"
    }
  },

  cdn: {
    provider: "cloudinary", // 또는 AWS S3 + CloudFront
    transformations: [
      "f_auto,q_auto",      // 자동 포맷/품질 최적화
      "w_1920,h_1080,c_fill", // 캐러셀 크기
      "w_1080,h_1080,c_fill"  // 모바일 크기
    ]
  }
}
```

#### B. 캐싱 전략

```javascript
// 캐러셀 데이터 캐싱
{
  redis: {
    carouselAds: {
      key: "carousel:ads:{placement}:{deviceType}",
      ttl: 300,  // 5분
      strategy: "cache-first"
    },

    adStats: {
      key: "ad:stats:{adId}:carousel",
      ttl: 60,   // 1분
      strategy: "write-through"
    }
  }
}
```

### 6. A/B 테스트 지원

#### A. 캐러셀 변형 테스트

```javascript
// A/B 테스트 설정
{
  experiments: {
    carouselAutoPlaySpeed: {
      variants: [
        { name: "fast", duration: 3000 },
        { name: "normal", duration: 5000 },
        { name: "slow", duration: 7000 }
      ],
      trafficSplit: [33, 34, 33],
      metrics: ["ctr", "viewTime", "slideCompletionRate"]
    },

    carouselImageStyle: {
      variants: [
        { name: "overlay_light", overlayOpacity: 0.2 },
        { name: "overlay_medium", overlayOpacity: 0.4 },
        { name: "overlay_dark", overlayOpacity: 0.6 }
      ]
    }
  }
}
```

## 🚀 구현 우선순위

### Phase 1 (필수)

1. 광고 모델에 캐러셀 필드 추가
2. `/api/ads/carousel` 엔드포인트 구현
3. 캐러셀 이벤트 추적 API 개선
4. 이미지 업로드 및 최적화 시스템

### Phase 2 (권장)

1. 관리자 인터페이스 개선
2. 캐러셀 미리보기 기능
3. 캐러셀 전용 통계 대시보드
4. 성능 최적화 (캐싱, CDN)

### Phase 3 (선택)

1. A/B 테스트 시스템
2. 고급 타겟팅 기능
3. 실시간 성과 모니터링
4. 자동 최적화 알고리즘

## 📊 예상 효과

### 사용자 경험

- **시각적 임팩트 증가**: 이미지 중심의 캐러셀로 주목도 향상
- **인터랙션 증가**: 슬라이드 네비게이션으로 사용자 참여도 증가
- **모바일 최적화**: 반응형 이미지로 모든 디바이스에서 최적 경험

### 광고 성과

- **CTR 향상**: 예상 30-50% 증가
- **브랜드 인지도**: 큰 이미지와 애니메이션으로 브랜드 임팩트 증가
- **체류시간 증가**: 캐러셀 인터랙션으로 페이지 체류시간 증가

### 수익성

- **광고 단가 상승**: 프리미엄 캐러셀 광고로 더 높은 단가 책정 가능
- **광고주 만족도**: 더 나은 성과로 광고주 재계약률 증가
- **인벤토리 효율성**: 하나의 위치에 여러 광고 노출로 수익 극대화

이 개선사항들을 단계적으로 구현하면 기존 텍스트 기반 광고 대비 훨씬 효과적인 캐러셀 광고 시스템을 구축할 수 있습니다.
