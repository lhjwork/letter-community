export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001",
  ENDPOINTS: {
    ADS_DISPLAYABLE: "/api/ads/displayable",
    ADS_DETAIL: "/api/ads",
    ADS_TRACK: "/api/ads/track",
    ADS_DEBUG: "/api/ads/debug",
  },
} as const;

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
  };
}
