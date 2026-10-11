import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getComments, getStoryReplies, type StoryReply } from "@/lib/api";
import FriendDetail, { type FriendLetter } from "./friend/FriendDetail";
import ReplyDetail, { type ReplyLetter } from "./story/ReplyDetail";
import StoryDetail from "./story/StoryDetail";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

type Letter = FriendLetter & {
  type: "story" | "friend";
  title?: string;
  category?: string;
  commentCount?: number;
  replyTo?: ReplyLetter["replyTo"];
  isAdminReply?: boolean;
  isAdopted?: boolean;
};

/** 토큰이 있으면 서버가 isAuthor 를 계산해 준다(작성자 ID 는 내려오지 않는다) */
async function getLetter(letterId: string, token?: string): Promise<Letter | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) return null;
    const { data } = await response.json();
    return {
      ...data,
      authorSettings: data.authorSettings || { allowPhysicalRequests: true },
    };
  } catch (error) {
    console.error("Failed to fetch letter:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ letterId: string }> }): Promise<Metadata> {
  const { letterId } = await params;
  const letter = await getLetter(letterId);

  if (!letter) {
    return { title: "편지를 찾을 수 없습니다" };
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
  const title = (letter.replyTo && `‘${letter.replyTo.title || "사연"}’에 온 답장`) || (letter.type === "story" && letter.title) || letter.ogTitle || letter.title || "당신에게 도착한 편지";
  // 카톡·SNS 미리보기 설명: 저장된 미리보기 → 없으면 본문 앞부분. 줄바꿈은 한 줄로
  const oneLine = (s?: string) => (s || "").replace(/\s+/g, " ").trim();
  const description = (oneLine(letter.ogPreviewText) || previewText).slice(0, 100) || "특별한 편지가 도착했습니다.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

export default async function LetterDetailPage({ params }: { params: Promise<{ letterId: string }> }) {
  const { letterId } = await params;
  const session = await auth();
  const token = session?.backendToken;
  const letter = await getLetter(letterId, token);

  if (!letter) {
    notFound();
  }

  if (letter.type === "story") {
    const [replies, comments] = await Promise.all([
      getStoryReplies(letterId).then((r) => r.data).catch((): StoryReply[] => []),
      getComments(letterId, 1, token).then((r) => r.data).catch(() => ({ items: [], total: letter.commentCount ?? 0, hasNextPage: false })),
    ]);
    return <StoryDetail story={letter} replies={replies} comments={comments} />;
  }

  // 사연에 단 답장은 읽기 전용 화면(실물 신청·작성자 관리 없음)
  if (letter.replyTo) {
    return <ReplyDetail reply={{ ...letter, replyTo: letter.replyTo }} />;
  }

  return <FriendDetail letter={letter} />;
}
