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
