# 📊 웹 분석 시스템 설계 프롬프트

## 📋 개요

Letter Community 서비스의 사용자 행동 추적 및 분석 시스템을 구현합니다.
QR 코드 접근, 모바일/데스크톱 구분, 유입 경로 등을 추적하여 서비스 개선에 활용합니다.

---

## 🎯 추적할 데이터

### 1. 기기 정보 (Device)

- **deviceType**: `mobile` | `tablet` | `desktop`
- **os**: `iOS` | `Android` | `Windows` | `macOS` | `Linux` | `other`
- **browser**: `Chrome` | `Safari` | `Firefox` | `Edge` | `Samsung` | `other`
- **screenSize**: `{ width, height }`

### 2. 유입 경로 (Traffic Source)

- **source**: `qr` | `direct` | `social` | `search` | `referral` | `email` | `other`
- **medium**: `offline` | `organic` | `paid` | `link` | `share`
- **campaign**: 캠페인 이름 (선택)
- **referrer**: 이전 페이지 URL

### 3. UTM 파라미터

- `utm_source`: 유입 소스 (qr, kakao, instagram, google 등)
- `utm_medium`: 매체 (offline, social, cpc, email 등)
- `utm_campaign`: 캠페인 이름
- `utm_content`: 콘텐츠 구분
- `utm_term`: 검색어 (검색 광고용)

### 4. 페이지 이벤트

- **pageView**: 페이지 조회
- **letterView**: 편지 상세 조회
- **letterCreate**: 편지 작성
- **letterShare**: 편지 공유
- **qrScan**: QR 코드 스캔 (utm_source=qr)

### 5. 세션 정보

- **sessionId**: 세션 고유 ID
- **userId**: 로그인 사용자 ID (선택)
- **isNewVisitor**: 신규 방문자 여부
- **visitCount**: 방문 횟수

---

## 🗂️ 데이터 스키마

### Analytics Event (MongoDB)

```javascript
{
  _id: ObjectId,

  // 이벤트 정보
  eventType: String,        // 'pageView', 'letterView', 'letterCreate', 'qrScan' 등
  eventData: Object,        // 이벤트별 추가 데이터

  // 페이지 정보
  page: {
    path: String,           // '/letter/abc123'
    title: String,          // '편지 상세'
    referrer: String,       // 이전 페이지
  },

  // 유입 경로
  traffic: {
    source: String,         // 'qr', 'direct', 'social', 'search', 'referral'
    medium: String,         // 'offline', 'organic', 'paid'
    campaign: String,       // 캠페인 이름
    referrer: String,       // document.referrer
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
    type: String,           // 'mobile', 'tablet', 'desktop'
    os: String,             // 'iOS', 'Android', 'Windows', 'macOS'
    browser: String,        // 'Chrome', 'Safari', 'Firefox'
    screenWidth: Number,
    screenHeight: Number,
    userAgent: String,
  },

  // 세션/사용자
  session: {
    sessionId: String,      // UUID
    userId: ObjectId,       // 로그인 사용자 (선택)
    isNewVisitor: Boolean,
    visitCount: Number,
  },

  // 편지 관련 (letterView, letterCreate 등)
  letter: {
    letterId: ObjectId,
    letterType: String,     // 'story', 'friend'
    category: String,       // AI 분류 카테고리
  },

  // 메타
  timestamp: Date,
  ip: String,               // 해시 처리
  country: String,          // GeoIP (선택)
  city: String,             // GeoIP (선택)
}
```

### Daily Stats (집계용)

```javascript
{
  _id: ObjectId,
  date: Date,               // 날짜 (YYYY-MM-DD)

  // 전체 통계
  totalPageViews: Number,
  uniqueVisitors: Number,
  newVisitors: Number,

  // 기기별
  deviceStats: {
    mobile: Number,
    tablet: Number,
    desktop: Number,
  },

  // 유입 경로별
  sourceStats: {
    qr: Number,
    direct: Number,
    social: Number,
    search: Number,
    referral: Number,
  },

  // 페이지별 조회수
  pageStats: [{
    path: String,
    views: Number,
  }],

  // 편지 통계
  letterStats: {
    totalViews: Number,
    totalCreated: Number,
    totalShared: Number,
    byCategory: Object,     // { '가족': 10, '사랑': 5, ... }
  },
}
```

---

## 📁 파일 구조

```
# Frontend (Next.js)
lib/
  analytics/
    index.ts              # 메인 export
    tracker.ts            # 이벤트 추적 함수
    device.ts             # 기기 정보 감지
    session.ts            # 세션 관리
    utm.ts                # UTM 파라미터 파싱

components/
  analytics/
    AnalyticsProvider.tsx # Context Provider

hooks/
  useAnalytics.ts         # 분석 훅
  usePageView.ts          # 페이지뷰 자동 추적

app/
  api/
    analytics/
      track/route.ts      # 이벤트 수집 API (프록시)

# Backend (Express)
routes/
  analytics.routes.js     # 분석 API 라우트

controllers/
  analytics.controller.js # 분석 컨트롤러

models/
  AnalyticsEvent.js       # 이벤트 모델
  DailyStats.js           # 일별 통계 모델

services/
  analytics.service.js    # 분석 서비스
  aggregation.service.js  # 집계 서비스

# Admin (별도 또는 통합)
app/
  admin/
    analytics/
      page.tsx            # 대시보드 메인
      realtime/page.tsx   # 실시간 현황
      sources/page.tsx    # 유입 경로 분석
      devices/page.tsx    # 기기별 분석
      letters/page.tsx    # 편지 분석
```

---

# 🎨 Frontend 프롬프트

## 📋 요구사항

Next.js 프로젝트에 웹 분석 시스템을 구현해주세요.
사용자의 기기 정보, 유입 경로, 페이지 이벤트를 추적합니다.

---

## 📦 1단계: 분석 유틸리티 생성

### 파일: `lib/analytics/device.ts`

```typescript
export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;

  // 기기 타입 감지
  const isMobile =
    /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  let type: DeviceInfo["type"] = "desktop";
  if (isTablet) type = "tablet";
  else if (isMobile) type = "mobile";

  // OS 감지
  let os = "other";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // 브라우저 감지
  let browser = "other";
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edge|Edg/i.test(ua)) browser = "Edge";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung";

  return {
    type,
    os,
    browser,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: ua,
  };
}
```

### 파일: `lib/analytics/utm.ts`

```typescript
export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface TrafficSource {
  source:
    | "qr"
    | "direct"
    | "social"
    | "search"
    | "referral"
    | "email"
    | "other";
  medium: string;
  campaign?: string;
  referrer?: string;
}

// UTM 파라미터 파싱
export function parseUTMParams(url?: string): UTMParams {
  const searchParams = new URLSearchParams(url || window.location.search);

  return {
    source: searchParams.get("utm_source") || undefined,
    medium: searchParams.get("utm_medium") || undefined,
    campaign: searchParams.get("utm_campaign") || undefined,
    content: searchParams.get("utm_content") || undefined,
    term: searchParams.get("utm_term") || undefined,
  };
}

// 유입 경로 분석
export function analyzeTrafficSource(
  utm: UTMParams,
  referrer?: string
): TrafficSource {
  // 1. UTM 파라미터가 있으면 우선 사용
  if (utm.source) {
    // QR 코드
    if (utm.source === "qr" || utm.medium === "offline") {
      return {
        source: "qr",
        medium: utm.medium || "offline",
        campaign: utm.campaign,
        referrer,
      };
    }

    // 소셜 미디어
    if (
      [
        "kakao",
        "instagram",
        "facebook",
        "twitter",
        "tiktok",
        "naver_blog",
      ].includes(utm.source)
    ) {
      return {
        source: "social",
        medium: utm.medium || "social",
        campaign: utm.campaign,
        referrer,
      };
    }

    // 이메일
    if (utm.source === "email" || utm.medium === "email") {
      return {
        source: "email",
        medium: "email",
        campaign: utm.campaign,
        referrer,
      };
    }

    // 검색 광고
    if (utm.medium === "cpc" || utm.medium === "ppc") {
      return {
        source: "search",
        medium: "paid",
        campaign: utm.campaign,
        referrer,
      };
    }

    return {
      source: "other",
      medium: utm.medium || "unknown",
      campaign: utm.campaign,
      referrer,
    };
  }

  // 2. Referrer 분석
  if (referrer) {
    const refUrl = new URL(referrer);
    const refHost = refUrl.hostname.toLowerCase();

    // 검색 엔진
    if (/google|naver|daum|bing|yahoo/i.test(refHost)) {
      return { source: "search", medium: "organic", referrer };
    }

    // 소셜 미디어
    if (/kakao|instagram|facebook|twitter|t\.co|tiktok/i.test(refHost)) {
      return { source: "social", medium: "organic", referrer };
    }

    // 기타 외부 링크
    return { source: "referral", medium: "link", referrer };
  }

  // 3. 직접 접속
  return { source: "direct", medium: "none" };
}

// URL에서 UTM 파라미터 제거 (히스토리 정리용)
export function cleanUTMFromURL(): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ].forEach((param) => {
    params.delete(param);
  });

  // URL 정리 (히스토리 교체)
  const cleanURL =
    url.pathname + (params.toString() ? "?" + params.toString() : "");
  window.history.replaceState({}, "", cleanURL);
}
```

### 파일: `lib/analytics/session.ts`

```typescript
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "letter_session";
const VISITOR_KEY = "letter_visitor";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

export interface SessionInfo {
  sessionId: string;
  visitorId: string;
  isNewVisitor: boolean;
  visitCount: number;
  startedAt: number;
}

export function getOrCreateSession(): SessionInfo {
  // 방문자 정보 (영구 저장)
  let visitorData = localStorage.getItem(VISITOR_KEY);
  let visitorId: string;
  let visitCount: number;
  let isNewVisitor = false;

  if (visitorData) {
    const parsed = JSON.parse(visitorData);
    visitorId = parsed.visitorId;
    visitCount = parsed.visitCount;
  } else {
    visitorId = uuidv4();
    visitCount = 0;
    isNewVisitor = true;
  }

  // 세션 정보 (세션 스토리지)
  let sessionData = sessionStorage.getItem(SESSION_KEY);
  let sessionId: string;
  let startedAt: number;

  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    const now = Date.now();

    // 세션 타임아웃 체크
    if (now - parsed.lastActivity > SESSION_TIMEOUT) {
      // 새 세션 시작
      sessionId = uuidv4();
      startedAt = now;
      visitCount += 1;
    } else {
      sessionId = parsed.sessionId;
      startedAt = parsed.startedAt;
    }
  } else {
    // 새 세션
    sessionId = uuidv4();
    startedAt = Date.now();
    visitCount += 1;
  }

  // 저장
  localStorage.setItem(VISITOR_KEY, JSON.stringify({ visitorId, visitCount }));
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      sessionId,
      startedAt,
      lastActivity: Date.now(),
    })
  );

  return {
    sessionId,
    visitorId,
    isNewVisitor,
    visitCount,
    startedAt,
  };
}

export function updateSessionActivity(): void {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    parsed.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
  }
}
```

### 파일: `lib/analytics/tracker.ts`

```typescript
import { getDeviceInfo, DeviceInfo } from "./device";
import {
  parseUTMParams,
  analyzeTrafficSource,
  UTMParams,
  TrafficSource,
} from "./utm";
import {
  getOrCreateSession,
  updateSessionActivity,
  SessionInfo,
} from "./session";

export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  page: {
    path: string;
    title: string;
    referrer: string;
  };
  traffic: TrafficSource;
  utm: UTMParams;
  device: DeviceInfo;
  session: SessionInfo;
  letter?: {
    letterId?: string;
    letterType?: string;
    category?: string;
  };
  timestamp: string;
}

class AnalyticsTracker {
  private initialized = false;
  private device: DeviceInfo | null = null;
  private session: SessionInfo | null = null;
  private utm: UTMParams | null = null;
  private traffic: TrafficSource | null = null;
  private queue: AnalyticsEvent[] = [];

  init() {
    if (this.initialized || typeof window === "undefined") return;

    this.device = getDeviceInfo();
    this.session = getOrCreateSession();
    this.utm = parseUTMParams();
    this.traffic = analyzeTrafficSource(this.utm, document.referrer);

    this.initialized = true;

    // 큐에 쌓인 이벤트 전송
    this.flushQueue();
  }

  private async flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) await this.sendEvent(event);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  async track(
    eventType: string,
    eventData?: Record<string, any>,
    letterData?: AnalyticsEvent["letter"]
  ) {
    updateSessionActivity();

    const event: AnalyticsEvent = {
      eventType,
      eventData,
      page: {
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
      },
      traffic: this.traffic || { source: "direct", medium: "none" },
      utm: this.utm || {},
      device: this.device || getDeviceInfo(),
      session: this.session || getOrCreateSession(),
      letter: letterData,
      timestamp: new Date().toISOString(),
    };

    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    await this.sendEvent(event);
  }

  // 편의 메서드들
  pageView(path?: string) {
    return this.track("pageView", { path: path || window.location.pathname });
  }

  letterView(letterId: string, letterType: string, category?: string) {
    return this.track("letterView", {}, { letterId, letterType, category });
  }

  letterCreate(letterId: string, letterType: string, category?: string) {
    return this.track("letterCreate", {}, { letterId, letterType, category });
  }

  letterShare(letterId: string, shareMethod: string) {
    return this.track("letterShare", { shareMethod }, { letterId });
  }

  qrScan(letterId?: string) {
    return this.track("qrScan", { letterId });
  }
}

export const analytics = new AnalyticsTracker();
```

### 파일: `lib/analytics/index.ts`

```typescript
export { analytics } from "./tracker";
export type { AnalyticsEvent } from "./tracker";
export { getDeviceInfo } from "./device";
export type { DeviceInfo } from "./device";
export { parseUTMParams, analyzeTrafficSource, cleanUTMFromURL } from "./utm";
export type { UTMParams, TrafficSource } from "./utm";
export { getOrCreateSession, updateSessionActivity } from "./session";
export type { SessionInfo } from "./session";
```

---

## 🎣 2단계: React 훅 생성

### 파일: `hooks/useAnalytics.ts`

```typescript
"use client";

import { useEffect, useCallback } from "react";
import { analytics, cleanUTMFromURL } from "@/lib/analytics";

export function useAnalytics() {
  useEffect(() => {
    analytics.init();

    // QR 코드로 접근한 경우 이벤트 발생
    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source") === "qr") {
      analytics.qrScan();
    }

    // URL 정리 (선택적)
    // cleanUTMFromURL();
  }, []);

  const trackPageView = useCallback((path?: string) => {
    analytics.pageView(path);
  }, []);

  const trackLetterView = useCallback(
    (letterId: string, letterType: string, category?: string) => {
      analytics.letterView(letterId, letterType, category);
    },
    []
  );

  const trackLetterCreate = useCallback(
    (letterId: string, letterType: string, category?: string) => {
      analytics.letterCreate(letterId, letterType, category);
    },
    []
  );

  const trackLetterShare = useCallback(
    (letterId: string, shareMethod: string) => {
      analytics.letterShare(letterId, shareMethod);
    },
    []
  );

  const trackEvent = useCallback(
    (eventType: string, eventData?: Record<string, any>) => {
      analytics.track(eventType, eventData);
    },
    []
  );

  return {
    trackPageView,
    trackLetterView,
    trackLetterCreate,
    trackLetterShare,
    trackEvent,
  };
}
```

### 파일: `hooks/usePageView.ts`

```typescript
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics";

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    analytics.init();
    analytics.pageView(pathname);
  }, [pathname]);
}
```

---

## 🔌 3단계: Analytics Provider

### 파일: `components/analytics/AnalyticsProvider.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analytics.init();
  }, []);

  useEffect(() => {
    // 페이지 변경 시 자동 추적
    analytics.pageView(pathname);

    // QR 접근 감지
    if (searchParams.get("utm_source") === "qr") {
      analytics.qrScan();
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

### 파일: `app/layout.tsx` 수정

```typescript
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 🔀 4단계: API Route (프록시)

### 파일: `app/api/analytics/track/route.ts`

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
    const response = await fetch(`${BACKEND_URL}/api/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        ip,
      }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // 분석 실패해도 사용자 경험에 영향 없도록
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
```

---

## 📍 5단계: 사용 예시

### 편지 상세 페이지에서 조회 추적

```typescript
// app/letter/[letterId]/page.tsx
"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function LetterDetailPage({
  params,
}: {
  params: { letterId: string };
}) {
  const { trackLetterView } = useAnalytics();
  const [letter, setLetter] = useState(null);

  useEffect(() => {
    // 편지 데이터 로드 후 추적
    if (letter) {
      trackLetterView(params.letterId, letter.type, letter.category);
    }
  }, [letter, params.letterId, trackLetterView]);

  // ...
}
```

### 편지 작성 완료 시 추적

```typescript
// app/(afterLogin)/write/page.tsx

const { trackLetterCreate } = useAnalytics();

const handleSubmit = async () => {
  // ... 편지 생성 로직

  if (result?.data?._id) {
    // 생성 추적
    trackLetterCreate(result.data._id, letterType, aiCategory);

    router.push(`/letter/${result.data._id}`);
  }
};
```

### 공유 버튼 클릭 시 추적

```typescript
const { trackLetterShare } = useAnalytics();

const handleShare = (method: "kakao" | "copy" | "qr") => {
  trackLetterShare(letterId, method);
  // ... 공유 로직
};
```

---

## 🔗 6단계: QR 코드 생성 시 UTM 추가

### 파일: `lib/qrcode.ts`

```typescript
export function generateLetterQRUrl(
  letterId: string,
  campaign?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://letter.community";
  const url = new URL(`/letter/${letterId}`, baseUrl);

  // UTM 파라미터 추가
  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "offline");
  if (campaign) {
    url.searchParams.set("utm_campaign", campaign);
  }

  return url.toString();
}
```

---

## ✅ 체크리스트

- [ ] `uuid` 패키지 설치: `pnpm add uuid && pnpm add -D @types/uuid`
- [ ] `lib/analytics/` 폴더 및 파일 생성
- [ ] `hooks/useAnalytics.ts`, `hooks/usePageView.ts` 생성
- [ ] `components/analytics/AnalyticsProvider.tsx` 생성
- [ ] `app/layout.tsx`에 AnalyticsProvider 추가
- [ ] `app/api/analytics/track/route.ts` 생성
- [ ] 편지 상세 페이지에 조회 추적 추가
- [ ] 편지 작성 페이지에 생성 추적 추가
- [ ] 공유 기능에 공유 추적 추가

---

# 🖥️ Backend 프롬프트

## 📋 요구사항

Express.js 백엔드에 웹 분석 시스템을 구현해주세요.
프론트엔드에서 전송하는 이벤트를 저장하고, 집계 데이터를 제공합니다.

---

## 📦 1단계: 모델 생성

### 파일: `models/AnalyticsEvent.js`

```javascript
const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema(
  {
    // 이벤트 정보
    eventType: {
      type: String,
      required: true,
      enum: [
        "pageView",
        "letterView",
        "letterCreate",
        "letterShare",
        "qrScan",
        "custom",
      ],
      index: true,
    },
    eventData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // 페이지 정보
    page: {
      path: String,
      title: String,
      referrer: String,
    },

    // 유입 경로
    traffic: {
      source: {
        type: String,
        enum: [
          "qr",
          "direct",
          "social",
          "search",
          "referral",
          "email",
          "other",
        ],
        default: "direct",
        index: true,
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
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop"],
        index: true,
      },
      os: String,
      browser: String,
      screenWidth: Number,
      screenHeight: Number,
      userAgent: String,
    },

    // 세션/사용자
    session: {
      sessionId: { type: String, index: true },
      visitorId: { type: String, index: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isNewVisitor: Boolean,
      visitCount: Number,
    },

    // 편지 관련
    letter: {
      letterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Letter",
        index: true,
      },
      letterType: String,
      category: String,
    },

    // 메타
    ip: String, // 해시 처리된 IP
    country: String,
    city: String,
  },
  {
    timestamps: true,
  }
);

// 복합 인덱스
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ "traffic.source": 1, createdAt: -1 });
analyticsEventSchema.index({ "device.type": 1, createdAt: -1 });
analyticsEventSchema.index({ "letter.letterId": 1, eventType: 1 });

// TTL 인덱스 (90일 후 자동 삭제 - 선택적)
// analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
```

### 파일: `models/DailyStats.js`

```javascript
const mongoose = require("mongoose");

const dailyStatsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },

    // 전체 통계
    totalPageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },

    // 기기별
    deviceStats: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
    },

    // 유입 경로별
    sourceStats: {
      qr: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    // OS별
    osStats: {
      iOS: { type: Number, default: 0 },
      Android: { type: Number, default: 0 },
      Windows: { type: Number, default: 0 },
      macOS: { type: Number, default: 0 },
      Linux: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    // 브라우저별
    browserStats: {
      Chrome: { type: Number, default: 0 },
      Safari: { type: Number, default: 0 },
      Firefox: { type: Number, default: 0 },
      Edge: { type: Number, default: 0 },
      Samsung: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    // 페이지별 조회수 (상위 20개)
    topPages: [
      {
        path: String,
        views: Number,
      },
    ],

    // 편지 통계
    letterStats: {
      totalViews: { type: Number, default: 0 },
      totalCreated: { type: Number, default: 0 },
      totalShared: { type: Number, default: 0 },
      byCategory: {
        type: Map,
        of: Number,
        default: {},
      },
      byType: {
        story: { type: Number, default: 0 },
        friend: { type: Number, default: 0 },
      },
    },

    // QR 통계
    qrStats: {
      totalScans: { type: Number, default: 0 },
      uniqueScans: { type: Number, default: 0 },
      byCampaign: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyStats", dailyStatsSchema);
```

---

## 🛣️ 2단계: 라우트 생성

### 파일: `routes/analytics.routes.js`

```javascript
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const {
  optionalAuth,
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

// 이벤트 수집 (인증 불필요)
router.post("/track", analyticsController.trackEvent);

// 통계 조회 (관리자 전용)
router.get(
  "/stats/overview",
  requireAdmin,
  analyticsController.getOverviewStats
);
router.get("/stats/daily", requireAdmin, analyticsController.getDailyStats);
router.get(
  "/stats/realtime",
  requireAdmin,
  analyticsController.getRealtimeStats
);
router.get("/stats/sources", requireAdmin, analyticsController.getSourceStats);
router.get("/stats/devices", requireAdmin, analyticsController.getDeviceStats);
router.get("/stats/letters", requireAdmin, analyticsController.getLetterStats);
router.get("/stats/qr", requireAdmin, analyticsController.getQRStats);

// 특정 편지 통계 (편지 작성자 또는 관리자)
router.get(
  "/letter/:letterId",
  optionalAuth,
  analyticsController.getLetterAnalytics
);

module.exports = router;
```

### 파일: `app.js` 또는 `index.js`에 추가

```javascript
const analyticsRoutes = require("./routes/analytics.routes");

app.use("/api/analytics", analyticsRoutes);
```

---

## 🎮 3단계: 컨트롤러 생성

### 파일: `controllers/analytics.controller.js`

```javascript
const AnalyticsEvent = require("../models/AnalyticsEvent");
const DailyStats = require("../models/DailyStats");
const crypto = require("crypto");

// IP 해시 함수
function hashIP(ip) {
  if (!ip) return "unknown";
  return crypto
    .createHash("sha256")
    .update(ip + process.env.IP_SALT || "letter")
    .digest("hex")
    .substring(0, 16);
}

// 오늘 날짜 (UTC 기준 00:00:00)
function getToday() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

// 이벤트 수집
exports.trackEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // IP 해시 처리
    const hashedIP = hashIP(eventData.ip || req.ip);

    // 이벤트 저장
    const event = new AnalyticsEvent({
      ...eventData,
      ip: hashedIP,
    });

    await event.save();

    // 일별 통계 업데이트 (비동기)
    updateDailyStats(event).catch(console.error);

    res.json({ success: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    res.json({ success: false }); // 에러여도 200 반환
  }
};

// 일별 통계 업데이트
async function updateDailyStats(event) {
  const today = getToday();

  const updateQuery = {
    $inc: {},
    $setOnInsert: { date: today },
  };

  // 페이지뷰
  if (event.eventType === "pageView") {
    updateQuery.$inc.totalPageViews = 1;
  }

  // 기기별
  if (event.device?.type) {
    updateQuery.$inc[`deviceStats.${event.device.type}`] = 1;
  }

  // 유입 경로별
  if (event.traffic?.source) {
    updateQuery.$inc[`sourceStats.${event.traffic.source}`] = 1;
  }

  // OS별
  if (event.device?.os) {
    const os = ["iOS", "Android", "Windows", "macOS", "Linux"].includes(
      event.device.os
    )
      ? event.device.os
      : "other";
    updateQuery.$inc[`osStats.${os}`] = 1;
  }

  // 브라우저별
  if (event.device?.browser) {
    const browser = ["Chrome", "Safari", "Firefox", "Edge", "Samsung"].includes(
      event.device.browser
    )
      ? event.device.browser
      : "other";
    updateQuery.$inc[`browserStats.${browser}`] = 1;
  }

  // 편지 관련
  if (event.eventType === "letterView") {
    updateQuery.$inc["letterStats.totalViews"] = 1;
    if (event.letter?.category) {
      updateQuery.$inc[`letterStats.byCategory.${event.letter.category}`] = 1;
    }
    if (event.letter?.letterType) {
      updateQuery.$inc[`letterStats.byType.${event.letter.letterType}`] = 1;
    }
  }

  if (event.eventType === "letterCreate") {
    updateQuery.$inc["letterStats.totalCreated"] = 1;
  }

  if (event.eventType === "letterShare") {
    updateQuery.$inc["letterStats.totalShared"] = 1;
  }

  // QR 스캔
  if (event.eventType === "qrScan" || event.traffic?.source === "qr") {
    updateQuery.$inc["qrStats.totalScans"] = 1;
    if (event.utm?.campaign) {
      updateQuery.$inc[`qrStats.byCampaign.${event.utm.campaign}`] = 1;
    }
  }

  await DailyStats.findOneAndUpdate({ date: today }, updateQuery, {
    upsert: true,
    new: true,
  });
}

// 개요 통계
exports.getOverviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await DailyStats.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalPageViews: { $sum: "$totalPageViews" },
          uniqueVisitors: { $sum: "$uniqueVisitors" },
          newVisitors: { $sum: "$newVisitors" },
          letterViews: { $sum: "$letterStats.totalViews" },
          letterCreated: { $sum: "$letterStats.totalCreated" },
          letterShared: { $sum: "$letterStats.totalShared" },
          qrScans: { $sum: "$qrStats.totalScans" },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalPageViews: 0,
        uniqueVisitors: 0,
        newVisitors: 0,
        letterViews: 0,
        letterCreated: 0,
        letterShared: 0,
        qrScans: 0,
      },
      period: { start, end },
    });
  } catch (error) {
    console.error("Overview stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 일별 통계
exports.getDailyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await DailyStats.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: stats,
      period: { start, end },
    });
  } catch (error) {
    console.error("Daily stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 실시간 통계 (최근 1시간)
exports.getRealtimeStats = async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [pageViews, activeUsers, recentEvents] = await Promise.all([
      // 최근 1시간 페이지뷰
      AnalyticsEvent.countDocuments({
        eventType: "pageView",
        createdAt: { $gte: oneHourAgo },
      }),

      // 활성 사용자 (고유 세션)
      AnalyticsEvent.distinct("session.sessionId", {
        createdAt: { $gte: oneHourAgo },
      }),

      // 최근 이벤트 10개
      AnalyticsEvent.find({
        createdAt: { $gte: oneHourAgo },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("eventType page.path device.type traffic.source createdAt"),
    ]);

    res.json({
      success: true,
      data: {
        pageViews,
        activeUsers: activeUsers.length,
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Realtime stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 유입 경로 통계
exports.getSourceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$traffic.source",
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$session.visitorId" },
        },
      },
      {
        $project: {
          source: "$_id",
          count: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: stats,
      period: { start, end },
    });
  } catch (error) {
    console.error("Source stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 기기 통계
exports.getDeviceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [deviceTypes, os, browsers] = await Promise.all([
      // 기기 타입별
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$device.type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // OS별
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$device.os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 브라우저별
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$device.browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: { deviceTypes, os, browsers },
      period: { start, end },
    });
  } catch (error) {
    console.error("Device stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 편지 통계
exports.getLetterStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [views, creates, shares, byCategory, topLetters] = await Promise.all([
      // 조회수
      AnalyticsEvent.countDocuments({
        eventType: "letterView",
        createdAt: { $gte: start, $lte: end },
      }),

      // 생성수
      AnalyticsEvent.countDocuments({
        eventType: "letterCreate",
        createdAt: { $gte: start, $lte: end },
      }),

      // 공유수
      AnalyticsEvent.countDocuments({
        eventType: "letterShare",
        createdAt: { $gte: start, $lte: end },
      }),

      // 카테고리별
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "letterView",
            createdAt: { $gte: start, $lte: end },
            "letter.category": { $exists: true },
          },
        },
        { $group: { _id: "$letter.category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 인기 편지 TOP 10
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "letterView",
            createdAt: { $gte: start, $lte: end },
            "letter.letterId": { $exists: true },
          },
        },
        { $group: { _id: "$letter.letterId", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        views,
        creates,
        shares,
        byCategory,
        topLetters,
      },
      period: { start, end },
    });
  } catch (error) {
    console.error("Letter stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// QR 통계
exports.getQRStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalScans, byCampaign, byDate] = await Promise.all([
      // 총 스캔수
      AnalyticsEvent.countDocuments({
        $or: [{ eventType: "qrScan" }, { "traffic.source": "qr" }],
        createdAt: { $gte: start, $lte: end },
      }),

      // 캠페인별
      AnalyticsEvent.aggregate([
        {
          $match: {
            $or: [{ eventType: "qrScan" }, { "traffic.source": "qr" }],
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: "$utm.campaign", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 일별
      AnalyticsEvent.aggregate([
        {
          $match: {
            $or: [{ eventType: "qrScan" }, { "traffic.source": "qr" }],
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalScans,
        byCampaign,
        byDate,
      },
      period: { start, end },
    });
  } catch (error) {
    console.error("QR stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 특정 편지 통계
exports.getLetterAnalytics = async (req, res) => {
  try {
    const { letterId } = req.params;

    const [views, shares, sources, devices] = await Promise.all([
      // 총 조회수
      AnalyticsEvent.countDocuments({
        eventType: "letterView",
        "letter.letterId": letterId,
      }),

      // 공유수
      AnalyticsEvent.countDocuments({
        eventType: "letterShare",
        "letter.letterId": letterId,
      }),

      // 유입 경로별
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "letterView",
            "letter.letterId": new mongoose.Types.ObjectId(letterId),
          },
        },
        { $group: { _id: "$traffic.source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 기기별
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "letterView",
            "letter.letterId": new mongoose.Types.ObjectId(letterId),
          },
        },
        { $group: { _id: "$device.type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        views,
        shares,
        sources,
        devices,
      },
    });
  } catch (error) {
    console.error("Letter analytics error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## ⏰ 4단계: 일별 집계 스케줄러 (선택)

### 파일: `jobs/aggregateStats.js`

```javascript
const cron = require("node-cron");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const DailyStats = require("../models/DailyStats");

// 매일 자정에 전날 통계 집계
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily stats aggregation...");

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 고유 방문자 수 계산
    const uniqueVisitors = await AnalyticsEvent.distinct("session.visitorId", {
      createdAt: { $gte: yesterday, $lt: today },
    });

    // 신규 방문자 수 계산
    const newVisitors = await AnalyticsEvent.countDocuments({
      "session.isNewVisitor": true,
      createdAt: { $gte: yesterday, $lt: today },
    });

    // 고유 세션 수
    const uniqueSessions = await AnalyticsEvent.distinct("session.sessionId", {
      createdAt: { $gte: yesterday, $lt: today },
    });

    // 인기 페이지 TOP 20
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "pageView",
          createdAt: { $gte: yesterday, $lt: today },
        },
      },
      {
        $group: {
          _id: "$page.path",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 20 },
      {
        $project: {
          path: "$_id",
          views: 1,
          _id: 0,
        },
      },
    ]);

    // QR 고유 스캔 수
    const uniqueQRScans = await AnalyticsEvent.distinct("session.visitorId", {
      $or: [{ eventType: "qrScan" }, { "traffic.source": "qr" }],
      createdAt: { $gte: yesterday, $lt: today },
    });

    // 업데이트
    await DailyStats.findOneAndUpdate(
      { date: yesterday },
      {
        $set: {
          uniqueVisitors: uniqueVisitors.length,
          newVisitors,
          totalSessions: uniqueSessions.length,
          topPages,
          "qrStats.uniqueScans": uniqueQRScans.length,
        },
      },
      { upsert: true }
    );

    console.log("Daily stats aggregation completed");
  } catch (error) {
    console.error("Daily stats aggregation error:", error);
  }
});

module.exports = {};
```

---

## ✅ 체크리스트

- [ ] `models/AnalyticsEvent.js` 생성
- [ ] `models/DailyStats.js` 생성
- [ ] `routes/analytics.routes.js` 생성
- [ ] `controllers/analytics.controller.js` 생성
- [ ] `app.js`에 라우트 등록
- [ ] 관리자 인증 미들웨어 확인
- [ ] (선택) `node-cron` 설치 및 스케줄러 설정
- [ ] 인덱스 생성 확인

---

# 🛠️ Admin 프롬프트

## 📋 요구사항

관리자 대시보드에 웹 분석 페이지를 구현해주세요.
실시간 현황, 유입 경로, 기기별 통계, 편지 분석 등을 시각화합니다.

---

## 📁 파일 구조

```
app/
  admin/
    analytics/
      page.tsx              # 대시보드 메인 (개요)
      realtime/
        page.tsx            # 실시간 현황
      sources/
        page.tsx            # 유입 경로 분석
      devices/
        page.tsx            # 기기별 분석
      letters/
        page.tsx            # 편지 분석
      qr/
        page.tsx            # QR 코드 분석

components/
  admin/
    analytics/
      OverviewCards.tsx     # 개요 카드
      TrafficChart.tsx      # 트래픽 차트
      SourcePieChart.tsx    # 유입 경로 파이 차트
      DeviceChart.tsx       # 기기별 차트
      RealtimeTable.tsx     # 실시간 이벤트 테이블
      DateRangePicker.tsx   # 날짜 범위 선택
```

---

## 📦 1단계: 패키지 설치

```bash
pnpm add recharts date-fns
```

---

## 🎨 2단계: 개요 대시보드

### 파일: `app/admin/analytics/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";

interface OverviewStats {
  totalPageViews: number;
  uniqueVisitors: number;
  newVisitors: number;
  letterViews: number;
  letterCreated: number;
  letterShared: number;
  qrScans: number;
}

interface DailyData {
  date: string;
  totalPageViews: number;
  uniqueVisitors: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
];

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  useEffect(() => {
    fetchData();
  }, [dateRange, session]);

  const fetchData = async () => {
    if (!session?.backendToken) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const [overviewRes, dailyRes, sourceRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?${params}`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        }),
        fetch(`/api/admin/analytics/daily?${params}`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        }),
        fetch(`/api/admin/analytics/sources?${params}`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        }),
      ]);

      const [overviewData, dailyDataRes, sourceDataRes] = await Promise.all([
        overviewRes.json(),
        dailyRes.json(),
        sourceRes.json(),
      ]);

      if (overviewData.success) setOverview(overviewData.data);
      if (dailyDataRes.success) {
        setDailyData(
          dailyDataRes.data.map((d: any) => ({
            date: format(new Date(d.date), "MM/dd", { locale: ko }),
            totalPageViews: d.totalPageViews,
            uniqueVisitors: d.uniqueVisitors || 0,
          }))
        );
      }
      if (sourceDataRes.success) {
        setSourceData(
          sourceDataRes.data.map((s: any) => ({
            name: getSourceLabel(s.source || s._id),
            value: s.count,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      qr: "QR 코드",
      direct: "직접 접속",
      social: "소셜 미디어",
      search: "검색 엔진",
      referral: "외부 링크",
      email: "이메일",
      other: "기타",
    };
    return labels[source] || source;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 분석 대시보드</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 7), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            7일
          </button>
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 30), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            30일
          </button>
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 90), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            90일
          </button>
        </div>
      </div>

      {/* 개요 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">페이지뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalPageViews?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">방문자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.uniqueVisitors?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">편지 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.letterViews?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">QR 스캔</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overview?.qrScans?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 트래픽 */}
        <Card>
          <CardHeader>
            <CardTitle>일별 트래픽</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalPageViews" name="페이지뷰" fill="#8884d8" />
                <Bar dataKey="uniqueVisitors" name="방문자" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 유입 경로 */}
        <Card>
          <CardHeader>
            <CardTitle>유입 경로</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 편지 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">편지 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview?.letterCreated?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">편지 공유</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overview?.letterShared?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">신규 방문자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overview?.newVisitors?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 📱 3단계: 실시간 현황 페이지

### 파일: `app/admin/analytics/realtime/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface RealtimeData {
  pageViews: number;
  activeUsers: number;
  recentEvents: {
    eventType: string;
    page: { path: string };
    device: { type: string };
    traffic: { source: string };
    createdAt: string;
  }[];
}

export default function RealtimePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // 30초마다 갱신
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchData = async () => {
    if (!session?.backendToken) return;

    try {
      const res = await fetch("/api/admin/analytics/realtime", {
        headers: { Authorization: `Bearer ${session.backendToken}` },
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Failed to fetch realtime data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      pageView: "👁️",
      letterView: "💌",
      letterCreate: "✍️",
      letterShare: "🔗",
      qrScan: "📱",
    };
    return icons[eventType] || "📊";
  };

  const getDeviceIcon = (deviceType: string) => {
    const icons: Record<string, string> = {
      mobile: "📱",
      tablet: "📱",
      desktop: "💻",
    };
    return icons[deviceType] || "🖥️";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚡ 실시간 현황</h1>
        <span className="text-sm text-gray-500">30초마다 자동 갱신</span>
      </div>

      {/* 실시간 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-80">
              최근 1시간 페이지뷰
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.pageViews || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-80">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.activeUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 이벤트 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 이벤트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentEvents?.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getEventIcon(event.eventType)}
                  </span>
                  <div>
                    <div className="font-medium">{event.page?.path || "/"}</div>
                    <div className="text-sm text-gray-500">
                      {getDeviceIcon(event.device?.type)}{" "}
                      {event.traffic?.source || "direct"}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(event.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            ))}

            {(!data?.recentEvents || data.recentEvents.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                최근 1시간 내 이벤트가 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📊 4단계: QR 분석 페이지

### 파일: `app/admin/analytics/qr/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { subDays } from "date-fns";

interface QRStats {
  totalScans: number;
  byCampaign: { _id: string; count: number }[];
  byDate: { _id: string; count: number }[];
}

export default function QRAnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<QRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  useEffect(() => {
    fetchData();
  }, [dateRange, session]);

  const fetchData = async () => {
    if (!session?.backendToken) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const res = await fetch(`/api/admin/analytics/qr?${params}`, {
        headers: { Authorization: `Bearer ${session.backendToken}` },
      });
      const result = await res.json();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error("Failed to fetch QR stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📱 QR 코드 분석</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 7), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            7일
          </button>
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 30), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            30일
          </button>
        </div>
      </div>

      {/* 총 스캔 수 */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm opacity-80">총 QR 스캔</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {stats?.totalScans?.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      {/* 일별 스캔 추이 */}
      <Card>
        <CardHeader>
          <CardTitle>일별 스캔 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.byDate || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="스캔 수"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 캠페인별 스캔 */}
      <Card>
        <CardHeader>
          <CardTitle>캠페인별 스캔</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.byCampaign && stats.byCampaign.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCampaign} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="_id" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="스캔 수" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">
              캠페인 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR 코드 생성 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 QR 코드 UTM 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            QR 코드 생성 시 다음 UTM 파라미터를 추가하면 추적이 가능합니다:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            https://letter.community/letter/[ID]
            <br />
            ?utm_source=qr
            <br />
            &utm_medium=offline
            <br />
            &utm_campaign=[캠페인명]
          </div>
          <div className="text-sm text-gray-500">
            예시: 결혼식 청첩장 → utm_campaign=wedding_invitation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔀 5단계: Admin API 프록시

### 파일: `app/api/admin/analytics/[...path]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const path = params.path.join("/");
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/api/analytics/stats/${path}${
      searchParams ? "?" + searchParams : ""
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin analytics proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
```

---

## 🧭 6단계: Admin 네비게이션

### 파일: `components/admin/AnalyticsNav.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/analytics", label: "📊 개요", exact: true },
  { href: "/admin/analytics/realtime", label: "⚡ 실시간" },
  { href: "/admin/analytics/sources", label: "🔗 유입 경로" },
  { href: "/admin/analytics/devices", label: "📱 기기별" },
  { href: "/admin/analytics/letters", label: "💌 편지" },
  { href: "/admin/analytics/qr", label: "📷 QR 코드" },
];

export function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-lg whitespace-nowrap transition-colors
              ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

---

## ✅ 체크리스트

- [ ] `recharts`, `date-fns` 패키지 설치
- [ ] `app/admin/analytics/page.tsx` 생성 (개요)
- [ ] `app/admin/analytics/realtime/page.tsx` 생성
- [ ] `app/admin/analytics/qr/page.tsx` 생성
- [ ] `app/api/admin/analytics/[...path]/route.ts` 생성
- [ ] `components/admin/AnalyticsNav.tsx` 생성
- [ ] 관리자 레이아웃에 네비게이션 추가
- [ ] 관리자 권한 체크 확인

---

## 🎨 UI 컴포넌트 참고

이 프롬프트는 `shadcn/ui`의 Card 컴포넌트를 사용합니다.
설치되어 있지 않다면:

```bash
npx shadcn-ui@latest add card
```

---

## 📚 참고 문서

- [Recharts 공식 문서](https://recharts.org/)
- [date-fns 공식 문서](https://date-fns.org/)
- [shadcn/ui Card](https://ui.shadcn.com/docs/components/card)

---

**구현 완료 후 테스트해보세요!** 🎉
