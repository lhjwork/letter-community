import { Metadata } from "next";
import { notFound } from "next/navigation";
import LetterDetailClient from "./LetterDetailClient";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface Letter {
  _id: string;
  type: "story" | "friend";
  content: string;
  ogTitle?: string;
  ogPreviewText: string;
  status: string;
  authorId: string;
  physicalLetterStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    completedRequests: number;
  };
  authorSettings: {
    allowPhysicalRequests: boolean;
    autoApprove: boolean;
    maxRequestsPerPerson: number;
    requireApprovalMessage?: string;
  };
  likeCount?: number;
  viewCount?: number;
  createdAt: string;
  // 기존 필드들 (하위 호환성)
  senderUserId?: string;
  receiverEmail?: string;
  physicalRequested?: boolean;
  address?: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
  };
}

async function getLetter(letterId: string): Promise<Letter | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const { data } = await response.json();

    // 새로운 필드들에 대한 기본값 설정 (백엔드 호환성)
    return {
      ...data,
      // senderId를 우선적으로 사용하고, 없으면 다른 필드들 확인
      authorId:
        data.senderId || data.authorId || data.senderUserId || "unknown",
      physicalLetterStats: data.physicalLetterStats || {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        completedRequests: 0,
      },
      authorSettings: data.authorSettings || {
        allowPhysicalRequests: true,
        autoApprove: false,
        maxRequestsPerPerson: 3,
        requireApprovalMessage: undefined,
      },
    };
  } catch (error) {
    console.error("Failed to fetch letter:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letterId: string }>;
}): Promise<Metadata> {
  const { letterId } = await params;
  const letter = await getLetter(letterId);

  if (!letter) {
    return {
      title: "편지를 찾을 수 없습니다",
    };
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/og?letterId=${letterId}`;
  const title = letter.ogTitle || "당신에게 도착한 편지";
  const description = letter.ogPreviewText || "특별한 편지가 도착했습니다.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function LetterDetailPage({
  params,
}: {
  params: Promise<{ letterId: string }>;
}) {
  const { letterId } = await params;
  const letter = await getLetter(letterId);

  if (!letter) {
    notFound();
  }

  return <LetterDetailClient letter={letter} />;
}
