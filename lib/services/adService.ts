import { API_CONFIG, ApiResponse } from "@/lib/config/api";
import {
  Ad,
  AdPlacement,
  AdEventType,
  AdDebugInfo,
  DisplayableAdsDebug,
} from "@/types/ad";

class AdService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`API 요청 실패 (${endpoint}):`, data.message);
      }

      return data;
    } catch (error) {
      console.error(`API 요청 에러 (${endpoint}):`, error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        meta: { timestamp: new Date().toISOString() },
      };
    }
  }

  // 캐러셀 전용 광고 목록 조회
  async getCarouselAds(options?: {
    placement?: AdPlacement;
    limit?: number;
    aspectRatio?: "16:9" | "21:9" | "4:3";
    deviceType?: "mobile" | "tablet" | "desktop";
    autoPlay?: boolean;
  }): Promise<Ad[]> {
    try {
      const url = new URL("/api/ads/carousel", API_CONFIG.BASE_URL);

      if (options?.placement)
        url.searchParams.set("placement", options.placement);
      if (options?.limit)
        url.searchParams.set("limit", options.limit.toString());
      if (options?.aspectRatio)
        url.searchParams.set("aspectRatio", options.aspectRatio);
      if (options?.deviceType)
        url.searchParams.set("deviceType", options.deviceType);
      if (options?.autoPlay !== undefined)
        url.searchParams.set("autoPlay", options.autoPlay.toString());

      const response = await this.fetchApi<Ad[]>(url.pathname + url.search);

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn("캐러셀 API 호출 실패, 기본 API 사용:", error);
    }

    // 폴백으로 기본 API 사용
    return this.getDisplayableAds({
      placement: options?.placement,
      limit: options?.limit,
    });
  }

  // 노출 가능한 광고 목록 조회
  async getDisplayableAds(options?: {
    placement?: AdPlacement;
    limit?: number;
    theme?: string;
  }): Promise<Ad[]> {
    const url = new URL(
      API_CONFIG.ENDPOINTS.ADS_DISPLAYABLE,
      API_CONFIG.BASE_URL
    );
    if (options?.placement)
      url.searchParams.set("placement", options.placement);
    if (options?.limit) url.searchParams.set("limit", options.limit.toString());
    if (options?.theme) url.searchParams.set("theme", options.theme);

    const response = await this.fetchApi<Ad[]>(url.pathname + url.search);
    return response.success ? response.data || [] : [];
  }

  // 특정 광고 조회
  async getAdBySlug(
    adSlug: string,
    placement?: AdPlacement
  ): Promise<Ad | null> {
    const url = new URL(
      `${API_CONFIG.ENDPOINTS.ADS_DETAIL}/${encodeURIComponent(adSlug)}`,
      API_CONFIG.BASE_URL
    );
    if (placement) {
      url.searchParams.set("placement", placement);
    }

    const response = await this.fetchApi<Ad>(url.pathname + url.search);
    return response.success ? response.data || null : null;
  }

  // 광고 디버그 정보 조회 (개발 환경용)
  async getAdDebugInfo(adSlug: string): Promise<AdDebugInfo | null> {
    if (process.env.NODE_ENV !== "development") return null;

    const response = await this.fetchApi<AdDebugInfo>(
      `${API_CONFIG.ENDPOINTS.ADS_DEBUG}/${encodeURIComponent(adSlug)}`
    );
    return response.success ? response.data || null : null;
  }

  // 노출 가능한 광고 목록 디버그 정보 조회 (개발 환경용)
  async getDisplayableAdsDebug(
    placement?: AdPlacement
  ): Promise<DisplayableAdsDebug | null> {
    if (process.env.NODE_ENV !== "development") return null;

    const url = new URL(
      API_CONFIG.ENDPOINTS.ADS_DISPLAYABLE,
      API_CONFIG.BASE_URL
    );
    url.searchParams.set("debug", "true");
    if (placement) url.searchParams.set("placement", placement);

    const response = await this.fetchApi<DisplayableAdsDebug>(
      url.pathname + url.search
    );
    return response.success ? response.data || null : null;
  }

  // 이벤트 추적
  async trackEvent(eventData: {
    eventType: AdEventType;
    adId: string;
    adSlug: string;
    letterId?: string;
    clickTarget?: string;
    dwellTime?: number;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  }): Promise<boolean> {
    const response = await this.fetchApi(API_CONFIG.ENDPOINTS.ADS_TRACK, {
      method: "POST",
      body: JSON.stringify({
        ...eventData,
        device: this.getDeviceInfo(),
        session: this.getOrCreateSession(),
        page: {
          path: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
        },
        timestamp: new Date().toISOString(),
      }),
    });

    return response.success;
  }

  // 기기 정보 수집
  private getDeviceInfo() {
    if (typeof window === "undefined") return {};

    const ua = navigator.userAgent;
    let type: "mobile" | "tablet" | "desktop" = "desktop";
    if (/Mobi|Android/i.test(ua)) type = "mobile";
    else if (/Tablet|iPad/i.test(ua)) type = "tablet";

    let os = "Unknown";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Mac/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iOS|iPhone|iPad/i.test(ua)) os = "iOS";

    let browser = "Unknown";
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Edge/i.test(ua)) browser = "Edge";

    return {
      type,
      os,
      browser,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      userAgent: ua,
    };
  }

  // 세션 관리
  private getOrCreateSession() {
    if (typeof window === "undefined") return {};

    const SESSION_KEY = "ad_session";
    const VISITOR_KEY = "ad_visitor";

    let session = sessionStorage.getItem(SESSION_KEY);
    let visitor = localStorage.getItem(VISITOR_KEY);
    let isNewVisitor = false;

    if (!visitor) {
      visitor = `visitor_${crypto.randomUUID()}`;
      localStorage.setItem(VISITOR_KEY, visitor);
      isNewVisitor = true;
    }

    if (!session) {
      session = `sess_${crypto.randomUUID()}`;
      sessionStorage.setItem(SESSION_KEY, session);
    }

    return {
      sessionId: session,
      visitorId: visitor,
      isNewVisitor,
    };
  }
}

export const adService = new AdService();
