import { Metadata } from "next";
import { notFound } from "next/navigation";
import AdLandingClient from "./AdLandingClient";
import { API_CONFIG } from "@/lib/config/api";
import { Ad } from "@/types/ad";

// 테스트용 목업 광고 데이터
const testAdsData: Record<string, Ad> = {
  "test-cafe-promo": {
    _id: "test-ad-001",
    name: "카페 블루밍 프로모션",
    slug: "test-cafe-promo",
    status: "active",
    advertiser: { name: "카페 블루밍" },
    content: {
      headline: "☕ 아메리카노 1+1 이벤트",
      description:
        "Letter 사용자만을 위한 특별 혜택! 매장 방문 시 이 쿠폰을 보여주시면 아메리카노 1+1 혜택을 드립니다. 따뜻한 커피 한 잔과 함께 소중한 편지를 나눠보세요.",
      ctaText: "쿠폰 받기",
      targetUrl: "https://example.com/cafe-promo",
      theme: "general",
    },
    campaign: {
      name: "카페 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
    displayControl: {
      isVisible: true,
      placements: ["banner", "landing"],
      priority: 50,
    },
    stats: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      uniqueVisitors: 0,
      avgDwellTime: 0,
    },
    linkedLetters: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  "test-bookstore-promo": {
    _id: "test-ad-002",
    name: "책방 오늘 프로모션",
    slug: "test-bookstore-promo",
    status: "active",
    advertiser: { name: "책방 오늘" },
    content: {
      headline: "📚 베스트셀러 20% 할인",
      description:
        "편지와 함께하는 독서의 즐거움! 이번 주말까지 베스트셀러 도서 20% 할인 이벤트를 진행합니다. 소중한 사람에게 책 한 권 선물해보세요.",
      ctaText: "할인 보기",
      targetUrl: "https://example.com/bookstore-promo",
      theme: "general",
    },
    campaign: {
      name: "서점 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
    displayControl: {
      isVisible: true,
      placements: ["banner", "landing"],
      priority: 50,
    },
    stats: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      uniqueVisitors: 0,
      avgDwellTime: 0,
    },
    linkedLetters: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  "test-flower-promo": {
    _id: "test-ad-003",
    name: "플라워샵 봄 프로모션",
    slug: "test-flower-promo",
    status: "active",
    advertiser: { name: "플라워샵 봄" },
    content: {
      headline: "🌷 꽃다발 무료 배송",
      description:
        "5만원 이상 구매 시 전국 어디든 무료 배송! 편지와 함께 아름다운 꽃다발을 선물해보세요. 마음을 전하는 가장 아름다운 방법입니다.",
      ctaText: "주문하기",
      targetUrl: "https://example.com/flower-promo",
      theme: "general",
    },
    campaign: {
      name: "꽃집 테스트 캠페인",
      startDate: "2024-01-01",
      endDate: "2030-12-31",
    },
    displayControl: {
      isVisible: true,
      placements: ["banner", "landing"],
      priority: 50,
    },
    stats: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      uniqueVisitors: 0,
      avgDwellTime: 0,
    },
    linkedLetters: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
};

async function getAdData(adSlug: string): Promise<Ad | null> {
  // 테스트용 광고 slug인 경우 목업 데이터 반환
  if (adSlug.startsWith("test-") && testAdsData[adSlug]) {
    return testAdsData[adSlug];
  }

  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADS_DETAIL}/${adSlug}`,
      {
        next: { revalidate: 60 },
      }
    );

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

  if (
    ad.status !== "active" ||
    !ad.displayControl.isVisible ||
    now < startDate ||
    now > endDate
  ) {
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
      utm={{
        source: search.utm_source,
        medium: search.utm_medium,
        campaign: search.utm_campaign,
      }}
    />
  );
}
