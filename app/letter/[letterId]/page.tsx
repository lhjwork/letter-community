import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getComments, getStoryReplies, type StoryReply } from "@/lib/api";
import LetterDetailClient from "./LetterDetailClient";
import { NARROW } from "./narrow";
import StoryDetail from "./story/StoryDetail";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface Letter {
  _id: string;
  type: "story" | "friend";
  title?: string;
  content: string;
  contentType?: "text" | "html";
  senderName?: string;
  recipientName?: string;
  category?: string;
  isAuthor?: boolean;
  commentCount?: number;
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

function textToHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
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
      // textarea 로 쓴 편지(contentType text)는 기존 읽기 화면(마음 편지)의 HTML 렌더러에 맞게 줄바꿈만 <br> 로. 사연 상세는 원문을 쓴다
      content: data.type === "story" || data.contentType !== "text" ? data.content : textToHtml(data.content ?? ""),
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

  // 본문 앞 2줄만 OG 이미지에 표시
  const previewText = (letter.content || "")
    .replace(/<\/(p|div|br)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .slice(0, 120);
  const ogImageUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/og?text=${encodeURIComponent(previewText)}`;
  const title = (letter.type === "story" && letter.title) || letter.ogTitle || "당신에게 도착한 편지";
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

  if (letter.type === "story") {
    const session = await auth();
    const token = session?.backendToken;
    const [replies, comments] = await Promise.all([
      getStoryReplies(letterId).then((r) => r.data).catch((): StoryReply[] => []),
      getComments(letterId, 1, token).then((r) => r.data).catch(() => ({ items: [], total: letter.commentCount ?? 0, hasNextPage: false })),
    ]);
    return <StoryDetail story={letter} replies={replies} comments={comments} />;
  }

  return (
    <div className={NARROW}>
      <LetterDetailClient letter={{ ...letter, type: "friend" }} />
    </div>
  );
}
