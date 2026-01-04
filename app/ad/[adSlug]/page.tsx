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

// 테스트용 목업 광고 데이터
const testAdsData: Record<string, AdData> = {
  "test-wedding-promo": {
    _id: "test-ad-001",
    slug: "test-wedding-promo",
    status: "active",
    advertiser: { name: "플라워카페" },
    content: {
      headline: "신혼부부 특별 할인 10%!",
      description:
        "결혼을 축하합니다! 플라워카페에서 특별한 혜택을 준비했어요. 아름다운 꽃다발과 함께 행복한 시작을 응원합니다.",
      ctaText: "혜택 받으러 가기",
      targetUrl: "https://example.com/wedding-promo",
      theme: "wedding",
    },
    campaign: {
      name: "웨딩 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
  },
  "test-birthday-promo": {
    _id: "test-ad-002",
    slug: "test-birthday-promo",
    status: "active",
    advertiser: { name: "스위트베이커리" },
    content: {
      headline: "🎂 생일 축하 특별 이벤트!",
      description:
        "소중한 분의 생일을 더욱 특별하게! 케이크 주문 시 미니 케이크를 무료로 드립니다.",
      ctaText: "이벤트 참여하기",
      targetUrl: "https://example.com/birthday-promo",
      theme: "birthday",
    },
    campaign: {
      name: "생일 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
  },
  "test-general-promo": {
    _id: "test-ad-003",
    slug: "test-general-promo",
    status: "active",
    advertiser: { name: "Letter Partners" },
    content: {
      headline: "Letter와 함께하는 특별한 혜택",
      description:
        "Letter Community 사용자만을 위한 특별 할인! 지금 바로 확인해보세요.",
      ctaText: "자세히 보기",
      targetUrl: "https://example.com/general-promo",
      theme: "general",
    },
    campaign: {
      name: "일반 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
  },
};

async function getAdData(adSlug: string): Promise<AdData | null> {
  // 테스트용 광고 slug인 경우 목업 데이터 반환
  if (adSlug.startsWith("test-") && testAdsData[adSlug]) {
    return testAdsData[adSlug];
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/ads/${adSlug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ adSlug: string }>;
}): Promise<Metadata> {
  const { adSlug } = await params;
  const ad = await getAdData(adSlug);

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
  params: Promise<{ adSlug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { adSlug } = await params;
  const search = await searchParams;
  const ad = await getAdData(adSlug);

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
      letterId={search.letter}
      utmSource={search.utm_source}
      utmMedium={search.utm_medium}
      utmCampaign={search.utm_campaign}
    />
  );
}
