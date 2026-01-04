# 📊 웹 분석 + 광고 QR 시스템 설계 프롬프트

## 📋 개요

Letter Community 서비스의 사용자 행동 추적 및 **광고 QR 랜딩 페이지** 시스템을 구현합니다.

### 핵심 기능

1. **일반 분석**: QR 코드 접근, 모바일/데스크톱 구분, 유입 경로 추적
2. **광고 QR 시스템**: 실물 편지에 광고주 QR 삽입 → Letter 랜딩 페이지 → 광고주 사이트 리다이렉트

---

## 🎯 광고 QR 플로우

```
┌─────────────────────────────────────────────────────────────────────┐
│                        실물 편지 (오프라인)                           │
│  ┌─────────┐                                                        │
│  │ QR 코드  │ ← 광고주 QR (예: 카페, 꽃집, 웨딩홀 등)                  │
│  └────┬────┘                                                        │
└───────┼─────────────────────────────────────────────────────────────┘
        │ 스캔
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Letter 랜딩 페이지 (letter.community/ad/[adId])         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🎉 특별한 혜택이 준비되어 있어요!                            │   │
│  │                                                              │   │
│  │  [광고주 로고]                                                │   │
│  │  "결혼을 축하합니다! 신혼부부 특별 할인 10%"                   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────┐                   │   │
│  │  │      💐 혜택 받으러 가기 →            │ ← 클릭 추적        │   │
│  │  └──────────────────────────────────────┘                   │   │
│  │                                                              │   │
│  │  Letter Community 제공                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  📊 추적 데이터: 노출수, 체류시간, 클릭수, 기기정보, 유입경로         │
└─────────────────────────────────────────────────────────────────────┘
        │ 클릭
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    광고주 사이트 (외부)                              │
│                    https://advertiser.com/promo                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ 데이터 스키마

### 1. Advertisement (광고) - MongoDB

```javascript
{
  _id: ObjectId,

  // 기본 정보
  name: String,                    // 광고명 (내부용)
  slug: String,                    // URL용 슬러그 (unique)
  status: String,                  // 'draft', 'active', 'paused', 'expired'

  // 광고주 정보
  advertiser: {
    name: String,                  // 광고주명 (예: "플라워카페")
    logo: String,                  // 로고 이미지 URL
    contactEmail: String,          // 담당자 이메일
    contactPhone: String,          // 담당자 연락처
  },

  // 광고 콘텐츠
  content: {
    headline: String,              // 헤드라인 (예: "신혼부부 특별 할인!")
    description: String,           // 설명 텍스트
    ctaText: String,               // CTA 버튼 텍스트 (예: "혜택 받으러 가기")
    targetUrl: String,             // 광고주 사이트 URL
    backgroundImage: String,       // 배경 이미지 (선택)
    backgroundColor: String,       // 배경 색상
    theme: String,                 // 테마 ('wedding', 'birthday', 'general' 등)
  },

  // 캠페인 설정
  campaign: {
    name: String,                  // 캠페인명 (예: "2024 봄 웨딩 시즌")
    startDate: Date,               // 시작일
    endDate: Date,                 // 종료일
    budget: Number,                // 예산 (선택)
    targetImpressions: Number,     // 목표 노출수 (선택)
    targetClicks: Number,          // 목표 클릭수 (선택)
  },

  // 연결된 편지 (어떤 편지에 이 광고가 포함되는지)
  linkedLetters: [{
    letterId: ObjectId,
    letterType: String,            // 'wedding', 'birthday' 등
    addedAt: Date,
  }],

  // 통계 (실시간 집계)
  stats: {
    impressions: Number,           // 노출수 (랜딩 페이지 조회)
    clicks: Number,                // 클릭수 (CTA 버튼 클릭)
    ctr: Number,                   // 클릭률 (clicks / impressions)
    uniqueVisitors: Number,        // 고유 방문자
    avgDwellTime: Number,          // 평균 체류 시간 (초)
  },

  // 메타
  createdBy: ObjectId,             // 생성자 (관리자)
  createdAt: Date,
  updatedAt: Date,
}
```

### 2. AdEvent (광고 이벤트) - MongoDB

```javascript
{
  _id: ObjectId,

  // 광고 정보
  adId: ObjectId,                  // 광고 ID (ref: Advertisement)
  adSlug: String,                  // 광고 슬러그

  // 이벤트 정보
  eventType: String,               // 'impression', 'click', 'dwell'
  eventData: {
    dwellTime: Number,             // 체류 시간 (dwell 이벤트용)
    clickTarget: String,           // 클릭 대상 ('cta', 'logo' 등)
  },

  // 연결된 편지 (어떤 편지에서 왔는지)
  letter: {
    letterId: ObjectId,
    letterType: String,
  },

  // 유입 경로
  traffic: {
    source: String,                // 'qr', 'direct', 'link'
    medium: String,                // 'offline', 'email', 'social'
    campaign: String,              // UTM 캠페인
    referrer: String,
  },

  // UTM 파라미터
  utm: {
    source: String,
    medium: String,
    campaign: String,
    content: String,
    term: String,
  },

  // 기기 정보
  device: {
    type: String,                  // 'mobile', 'tablet', 'desktop'
    os: String,
    browser: String,
    screenWidth: Number,
    screenHeight: Number,
    userAgent: String,
  },

  // 세션/사용자
  session: {
    sessionId: String,
    visitorId: String,
    isNewVisitor: Boolean,
  },

  // 메타
  ip: String,                      // 해시 처리
  timestamp: Date,
  createdAt: Date,
}
```

### 3. AnalyticsEvent 확장 (기존 스키마에 추가)

```javascript
{
  // ... 기존 필드들 ...

  // 광고 관련 (광고 페이지 접근 시)
  ad: {
    adId: ObjectId,
    adSlug: String,
    eventType: String,             // 'impression', 'click'
  },
}
```

---

## 📁 파일 구조

```
# Frontend (Next.js)
app/
  ad/
    [adSlug]/
      page.tsx                    # 광고 랜딩 페이지
      opengraph-image.tsx         # OG 이미지 동적 생성
  api/
    ad/
      [adSlug]/
        route.ts                  # 광고 정보 조회
      track/
        route.ts                  # 광고 이벤트 추적
    analytics/
      track/
        route.ts                  # 일반 분석 이벤트 추적

lib/
  analytics/
    index.ts
    tracker.ts
    device.ts
    session.ts
    utm.ts
    ad-tracker.ts                 # 광고 전용 추적

components/
  ad/
    AdLandingPage.tsx             # 광고 랜딩 페이지 컴포넌트
    AdCTAButton.tsx               # CTA 버튼 (클릭 추적 포함)

# Backend (Express)
models/
  Advertisement.js                # 광고 모델
  AdEvent.js                      # 광고 이벤트 모델
  AnalyticsEvent.js               # 일반 분석 이벤트

routes/
  ad.routes.js                    # 광고 API 라우트
  analytics.routes.js             # 분석 API 라우트

controllers/
  ad.controller.js                # 광고 컨트롤러
  analytics.controller.js         # 분석 컨트롤러

# Admin
app/
  admin/
    ads/
      page.tsx                    # 광고 목록
      new/page.tsx                # 광고 생성
      [adId]/
        page.tsx                  # 광고 상세/수정
        stats/page.tsx            # 광고 통계
    analytics/
      page.tsx                    # 분석 대시보드
      qr/page.tsx                 # QR 분석
      ads/page.tsx                # 광고 분석 대시보드
```

---

## 🔗 QR 코드 URL 구조

### 1. 일반 편지 QR (기존)

```
https://letter.community/letter/[letterId]
  ?utm_source=qr
  &utm_medium=offline
  &utm_campaign=wedding_invitation
```

### 2. 광고 QR (신규)

```
https://letter.community/ad/[adSlug]
  ?utm_source=qr
  &utm_medium=offline
  &utm_campaign=spring_wedding_2024
  &letter=[letterId]              # 어떤 편지에서 왔는지 (선택)
```

### 3. 편지 내 광고 링크 (편지 페이지에서 광고로 이동)

```
https://letter.community/ad/[adSlug]
  ?utm_source=letter
  &utm_medium=link
  &letter=[letterId]
```

---

# 🎨 Frontend 프롬프트

## 📋 요구사항

Next.js 프로젝트에 **광고 QR 랜딩 페이지**와 **웹 분석 시스템**을 구현해주세요.

---

## 📦 1단계: 패키지 설치

```bash
pnpm add uuid
pnpm add -D @types/uuid
```

---

## 🎯 2단계: 광고 랜딩 페이지

### 파일: `app/ad/[adSlug]/page.tsx`

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AdLandingClient from "./AdLandingClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AdData {
  _id: string;
  slug: string;
  status: string;
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
  campaign: {
    name: string;
    startDate: string;
    endDate: string;
  };
}

async function getAdData(adSlug: string): Promise<AdData | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ads/${adSlug}`, {
      next: { revalidate: 60 }, // 1분 캐시
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// 동적 메타데이터
export async function generateMetadata({
  params,
}: {
  params: { adSlug: string };
}): Promise<Metadata> {
  const ad = await getAdData(params.adSlug);

  if (!ad) {
    return { title: "광고를 찾을 수 없습니다" };
  }

  return {
    title: `${ad.content.headline} | ${ad.advertiser.name}`,
    description: ad.content.description,
    openGraph: {
      title: ad.content.headline,
      description: ad.content.description,
      images: ad.content.backgroundImage ? [ad.content.backgroundImage] : [],
    },
  };
}

export default async function AdLandingPage({
  params,
  searchParams,
}: {
  params: { adSlug: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const ad = await getAdData(params.adSlug);

  if (!ad) {
    notFound();
  }

  // 캠페인 기간 체크
  const now = new Date();
  const startDate = new Date(ad.campaign.startDate);
  const endDate = new Date(ad.campaign.endDate);

  if (ad.status !== "active" || now < startDate || now > endDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            이 프로모션은 종료되었습니다
          </h1>
          <p className="text-gray-600">다른 혜택을 확인해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <AdLandingClient
      ad={ad}
      letterId={searchParams.letter}
      utmSource={searchParams.utm_source}
      utmMedium={searchParams.utm_medium}
      utmCampaign={searchParams.utm_campaign}
    />
  );
}
```

### 파일: `app/ad/[adSlug]/AdLandingClient.tsx`

```typescript
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
    await trackAdDwell({
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
          bg:
            ad.content.backgroundColor ||
            "bg-gradient-to-br from-gray-50 to-gray-100",
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
```

---

## 📊 3단계: 광고 추적 유틸리티

### 파일: `lib/analytics/ad-tracker.ts`

```typescript
import { getDeviceInfo } from "./device";
import { getOrCreateSession } from "./session";

interface AdTrackingData {
  adId: string;
  adSlug: string;
  letterId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

interface AdClickData extends AdTrackingData {
  clickTarget: string;
}

interface AdDwellData extends AdTrackingData {
  dwellTime: number;
}

async function sendAdEvent(eventType: string, data: Record<string, any>) {
  try {
    const device = getDeviceInfo();
    const session = getOrCreateSession();

    await fetch("/api/ad/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        ...data,
        device,
        session,
        page: {
          path: window.location.pathname,
          referrer: document.referrer,
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Ad tracking error:", error);
  }
}

// 광고 노출 추적
export async function trackAdImpression(data: AdTrackingData) {
  return sendAdEvent("impression", data);
}

// 광고 클릭 추적
export async function trackAdClick(data: AdClickData) {
  return sendAdEvent("click", data);
}

// 광고 체류 시간 추적
export async function trackAdDwell(data: AdDwellData) {
  // Beacon API 사용 (페이지 이탈 시에도 전송 보장)
  const payload = JSON.stringify({
    eventType: "dwell",
    ...data,
    timestamp: new Date().toISOString(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/ad/track", payload);
  } else {
    return sendAdEvent("dwell", data);
  }
}
```

---

## 🔀 4단계: API Routes

### 파일: `app/api/ad/[adSlug]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { adSlug: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ads/${params.adSlug}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ad fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}
```

### 파일: `app/api/ad/track/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 클라이언트 IP 추출
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 백엔드로 전달
    const response = await fetch(`${BACKEND_URL}/api/ads/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, ip }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad tracking error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
```

---

## 🔗 5단계: QR 코드 생성 유틸리티

### 파일: `lib/qrcode.ts`

```typescript
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://letter.community";

// 일반 편지 QR URL 생성
export function generateLetterQRUrl(
  letterId: string,
  campaign?: string
): string {
  const url = new URL(`/letter/${letterId}`, APP_URL);

  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "offline");
  if (campaign) {
    url.searchParams.set("utm_campaign", campaign);
  }

  return url.toString();
}

// 광고 QR URL 생성
export function generateAdQRUrl(
  adSlug: string,
  options?: {
    letterId?: string;
    campaign?: string;
  }
): string {
  const url = new URL(`/ad/${adSlug}`, APP_URL);

  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "offline");

  if (options?.letterId) {
    url.searchParams.set("letter", options.letterId);
  }
  if (options?.campaign) {
    url.searchParams.set("utm_campaign", options.campaign);
  }

  return url.toString();
}

// QR 코드 이미지 URL 생성 (외부 서비스 사용)
export function generateQRImageUrl(targetUrl: string, size = 200): string {
  // Google Charts API 사용 (무료)
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(
    targetUrl
  )}`;
}
```

---

## ✅ Frontend 체크리스트

- [ ] `uuid` 패키지 설치
- [ ] `app/ad/[adSlug]/page.tsx` 생성
- [ ] `app/ad/[adSlug]/AdLandingClient.tsx` 생성
- [ ] `lib/analytics/ad-tracker.ts` 생성
- [ ] `app/api/ad/[adSlug]/route.ts` 생성
- [ ] `app/api/ad/track/route.ts` 생성
- [ ] `lib/qrcode.ts` 생성
- [ ] 기존 분석 유틸리티 (`lib/analytics/`) 생성

---

# 🖥️ Backend 프롬프트

## 📋 요구사항

Express.js 백엔드에 **광고 관리 API**와 **웹 분석 시스템**을 구현해주세요.

---

## 📦 1단계: 모델 생성

### 파일: `models/Advertisement.js`

```javascript
const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    // 기본 정보
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "expired"],
      default: "draft",
      index: true,
    },

    // 광고주 정보
    advertiser: {
      name: { type: String, required: true },
      logo: String,
      contactEmail: String,
      contactPhone: String,
    },

    // 광고 콘텐츠
    content: {
      headline: { type: String, required: true },
      description: { type: String, required: true },
      ctaText: { type: String, default: "자세히 보기" },
      targetUrl: { type: String, required: true },
      backgroundImage: String,
      backgroundColor: { type: String, default: "#ffffff" },
      theme: {
        type: String,
        enum: ["wedding", "birthday", "congratulation", "general"],
        default: "general",
      },
    },

    // 캠페인 설정
    campaign: {
      name: String,
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      budget: Number,
      targetImpressions: Number,
      targetClicks: Number,
    },

    // 연결된 편지
    linkedLetters: [
      {
        letterId: { type: mongoose.Schema.Types.ObjectId, ref: "Letter" },
        letterType: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // 실시간 통계
    stats: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      avgDwellTime: { type: Number, default: 0 },
    },

    // 메타
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// 슬러그 자동 생성
advertisementSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// CTR 계산
advertisementSchema.methods.calculateCTR = function () {
  if (this.stats.impressions > 0) {
    this.stats.ctr = (this.stats.clicks / this.stats.impressions) * 100;
  }
  return this.stats.ctr;
};

// 인덱스
advertisementSchema.index({ "campaign.startDate": 1, "campaign.endDate": 1 });
advertisementSchema.index({ status: 1, "campaign.endDate": 1 });

module.exports = mongoose.model("Advertisement", advertisementSchema);
```

### 파일: `models/AdEvent.js`

```javascript
const mongoose = require("mongoose");

const adEventSchema = new mongoose.Schema(
  {
    // 광고 정보
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertisement",
      required: true,
      index: true,
    },
    adSlug: {
      type: String,
      required: true,
      index: true,
    },

    // 이벤트 정보
    eventType: {
      type: String,
      required: true,
      enum: ["impression", "click", "dwell"],
      index: true,
    },
    eventData: {
      dwellTime: Number,
      clickTarget: String,
    },

    // 연결된 편지
    letter: {
      letterId: { type: mongoose.Schema.Types.ObjectId, ref: "Letter" },
      letterType: String,
    },

    // 유입 경로
    traffic: {
      source: {
        type: String,
        enum: ["qr", "direct", "link", "social", "email", "other"],
        default: "direct",
      },
      medium: String,
      campaign: String,
      referrer: String,
    },

    // UTM 파라미터
    utm: {
      source: String,
      medium: String,
      campaign: String,
      content: String,
      term: String,
    },

    // 기기 정보
    device: {
      type: { type: String, enum: ["mobile", "tablet", "desktop"] },
      os: String,
      browser: String,
      screenWidth: Number,
      screenHeight: Number,
      userAgent: String,
    },

    // 세션/사용자
    session: {
      sessionId: String,
      visitorId: { type: String, index: true },
      isNewVisitor: Boolean,
    },

    // 메타
    ip: String,
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// 복합 인덱스
adEventSchema.index({ adId: 1, eventType: 1, createdAt: -1 });
adEventSchema.index({ adSlug: 1, createdAt: -1 });
adEventSchema.index({ "traffic.source": 1, createdAt: -1 });
adEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdEvent", adEventSchema);
```

---

## 🛣️ 2단계: 라우트 생성

### 파일: `routes/ad.routes.js`

```javascript
const express = require("express");
const router = express.Router();
const adController = require("../controllers/ad.controller");
const {
  optionalAuth,
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

// 공개 API
router.get("/:adSlug", adController.getAdBySlug); // 광고 정보 조회
router.post("/track", adController.trackAdEvent); // 이벤트 추적

// 관리자 API
router.get("/", requireAdmin, adController.getAllAds); // 광고 목록
router.post("/", requireAdmin, adController.createAd); // 광고 생성
router.put("/:adId", requireAdmin, adController.updateAd); // 광고 수정
router.delete("/:adId", requireAdmin, adController.deleteAd); // 광고 삭제
router.get("/:adId/stats", requireAdmin, adController.getAdStats); // 광고 통계

// 광고-편지 연결
router.post("/:adId/link-letter", requireAdmin, adController.linkLetter);
router.delete(
  "/:adId/unlink-letter/:letterId",
  requireAdmin,
  adController.unlinkLetter
);

module.exports = router;
```

### 파일: `app.js`에 추가

```javascript
const adRoutes = require("./routes/ad.routes");

app.use("/api/ads", adRoutes);
```

---

## 🎮 3단계: 컨트롤러 생성

### 파일: `controllers/ad.controller.js`

```javascript
const Advertisement = require("../models/Advertisement");
const AdEvent = require("../models/AdEvent");
const crypto = require("crypto");

// IP 해시 함수
function hashIP(ip) {
  if (!ip) return "unknown";
  return crypto
    .createHash("sha256")
    .update(ip + (process.env.IP_SALT || "letter"))
    .digest("hex")
    .substring(0, 16);
}

// 유입 경로 분석
function analyzeTrafficSource(utm, referrer) {
  if (utm?.source === "qr" || utm?.medium === "offline") {
    return {
      source: "qr",
      medium: utm.medium || "offline",
      campaign: utm.campaign,
    };
  }
  if (utm?.source === "letter") {
    return { source: "link", medium: "letter", campaign: utm.campaign };
  }
  if (referrer) {
    return { source: "referral", medium: "link", referrer };
  }
  return { source: "direct", medium: "none" };
}

// 광고 정보 조회 (공개)
exports.getAdBySlug = async (req, res) => {
  try {
    const { adSlug } = req.params;

    const ad = await Advertisement.findOne({
      slug: adSlug,
      status: { $in: ["active", "paused"] }, // draft, expired 제외
    }).select("-createdBy -__v");

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Get ad error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 이벤트 추적
exports.trackAdEvent = async (req, res) => {
  try {
    const {
      eventType,
      adId,
      adSlug,
      letterId,
      clickTarget,
      dwellTime,
      utm,
      device,
      session,
      page,
      ip,
    } = req.body;

    // 유입 경로 분석
    const traffic = analyzeTrafficSource(utm, page?.referrer);

    // 이벤트 저장
    const event = new AdEvent({
      adId,
      adSlug,
      eventType,
      eventData: {
        dwellTime,
        clickTarget,
      },
      letter: letterId ? { letterId } : undefined,
      traffic,
      utm,
      device,
      session,
      ip: hashIP(ip || req.ip),
      timestamp: new Date(),
    });

    await event.save();

    // 광고 통계 업데이트 (비동기)
    updateAdStats(adId, eventType, session?.visitorId, dwellTime).catch(
      console.error
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Track ad event error:", error);
    res.json({ success: false }); // 에러여도 200 반환
  }
};

// 광고 통계 업데이트
async function updateAdStats(adId, eventType, visitorId, dwellTime) {
  const updateQuery = { $inc: {} };

  if (eventType === "impression") {
    updateQuery.$inc["stats.impressions"] = 1;
  }

  if (eventType === "click") {
    updateQuery.$inc["stats.clicks"] = 1;
  }

  const ad = await Advertisement.findByIdAndUpdate(adId, updateQuery, {
    new: true,
  });

  if (ad) {
    // CTR 재계산
    ad.calculateCTR();
    await ad.save();
  }

  // 고유 방문자 수 업데이트 (별도 집계)
  if (eventType === "impression" && visitorId) {
    const uniqueCount = await AdEvent.distinct("session.visitorId", {
      adId,
      eventType: "impression",
    });

    await Advertisement.findByIdAndUpdate(adId, {
      "stats.uniqueVisitors": uniqueCount.length,
    });
  }

  // 평균 체류 시간 업데이트
  if (eventType === "dwell" && dwellTime) {
    const dwellEvents = await AdEvent.find({
      adId,
      eventType: "dwell",
      "eventData.dwellTime": { $exists: true },
    }).select("eventData.dwellTime");

    if (dwellEvents.length > 0) {
      const totalDwell = dwellEvents.reduce(
        (sum, e) => sum + (e.eventData?.dwellTime || 0),
        0
      );
      const avgDwell = Math.round(totalDwell / dwellEvents.length);

      await Advertisement.findByIdAndUpdate(adId, {
        "stats.avgDwellTime": avgDwell,
      });
    }
  }
}

// 광고 목록 조회 (관리자)
exports.getAllAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const ads = await Advertisement.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("createdBy", "name email");

    const total = await Advertisement.countDocuments(query);

    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all ads error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 광고 생성 (관리자)
exports.createAd = async (req, res) => {
  try {
    const adData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const ad = new Advertisement(adData);
    await ad.save();

    res.status(201).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Create ad error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 광고 수정 (관리자)
exports.updateAd = async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Advertisement.findByIdAndUpdate(
      adId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Update ad error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 광고 삭제 (관리자)
exports.deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Advertisement.findByIdAndDelete(adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    // 관련 이벤트도 삭제 (선택적)
    await AdEvent.deleteMany({ adId });

    res.json({
      success: true,
      message: "광고가 삭제되었습니다",
    });
  } catch (error) {
    console.error("Delete ad error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 광고 통계 조회 (관리자)
exports.getAdStats = async (req, res) => {
  try {
    const { adId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    // 기간별 통계
    const [impressions, clicks, byDate, bySource, byDevice] = await Promise.all(
      [
        // 노출수
        AdEvent.countDocuments({
          adId,
          eventType: "impression",
          createdAt: { $gte: start, $lte: end },
        }),

        // 클릭수
        AdEvent.countDocuments({
          adId,
          eventType: "click",
          createdAt: { $gte: start, $lte: end },
        }),

        // 일별 추이
        AdEvent.aggregate([
          {
            $match: {
              adId: ad._id,
              eventType: { $in: ["impression", "click"] },
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                eventType: "$eventType",
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.date": 1 } },
        ]),

        // 유입 경로별
        AdEvent.aggregate([
          {
            $match: {
              adId: ad._id,
              eventType: "impression",
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: "$traffic.source",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // 기기별
        AdEvent.aggregate([
          {
            $match: {
              adId: ad._id,
              eventType: "impression",
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: "$device.type",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]
    );

    // 일별 데이터 정리
    const dailyData = {};
    byDate.forEach((item) => {
      const date = item._id.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, impressions: 0, clicks: 0 };
      }
      dailyData[date][
        item._id.eventType === "impression" ? "impressions" : "clicks"
      ] = item.count;
    });

    res.json({
      success: true,
      data: {
        ad: {
          _id: ad._id,
          name: ad.name,
          slug: ad.slug,
          status: ad.status,
        },
        summary: {
          impressions,
          clicks,
          ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
          uniqueVisitors: ad.stats.uniqueVisitors,
          avgDwellTime: ad.stats.avgDwellTime,
        },
        daily: Object.values(dailyData),
        bySource,
        byDevice,
      },
      period: { start, end },
    });
  } catch (error) {
    console.error("Get ad stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 편지-광고 연결
exports.linkLetter = async (req, res) => {
  try {
    const { adId } = req.params;
    const { letterId, letterType } = req.body;

    const ad = await Advertisement.findByIdAndUpdate(
      adId,
      {
        $addToSet: {
          linkedLetters: { letterId, letterType, addedAt: new Date() },
        },
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Link letter error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 편지-광고 연결 해제
exports.unlinkLetter = async (req, res) => {
  try {
    const { adId, letterId } = req.params;

    const ad = await Advertisement.findByIdAndUpdate(
      adId,
      {
        $pull: {
          linkedLetters: { letterId },
        },
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "광고를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Unlink letter error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## ✅ Backend 체크리스트

- [ ] `models/Advertisement.js` 생성
- [ ] `models/AdEvent.js` 생성
- [ ] `routes/ad.routes.js` 생성
- [ ] `controllers/ad.controller.js` 생성
- [ ] `app.js`에 라우트 등록
- [ ] 관리자 인증 미들웨어 확인
- [ ] 인덱스 생성 확인

---
