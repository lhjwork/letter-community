import { Metadata } from "next";
import { notFound } from "next/navigation";
import LetterDetailClient from "./LetterDetailClient";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface Letter {
  _id: string;
  type: "story" | "friend";
  senderUserId?: string;
  receiverEmail?: string;
  content: string;
  ogTitle?: string;
  ogPreviewText: string;
  status: string;
  physicalRequested: boolean;
  address?: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
  };
  createdAt: string;
}

async function getLetter(letterId: string): Promise<Letter | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const { data } = await response.json();
    return data;
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

  const ogImageUrl = `${
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  }/api/og?letterId=${letterId}`;
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
