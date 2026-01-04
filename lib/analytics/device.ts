export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      type: "desktop",
      os: "unknown",
      browser: "unknown",
      screenWidth: 0,
      screenHeight: 0,
      userAgent: "",
    };
  }

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
