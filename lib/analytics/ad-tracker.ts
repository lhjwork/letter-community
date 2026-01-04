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

async function sendAdEvent(
  eventType: string,
  data: AdTrackingData | AdClickData | AdDwellData
) {
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
          path: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
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
export function trackAdDwell(data: AdDwellData) {
  const payload = JSON.stringify({
    eventType: "dwell",
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Beacon API 사용 (페이지 이탈 시에도 전송 보장)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/ad/track", payload);
  } else {
    sendAdEvent("dwell", data);
  }
}
