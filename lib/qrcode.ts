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
