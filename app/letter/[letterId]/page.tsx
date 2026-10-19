import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getComments, getStoryReplies } from "@/lib/api";
import { OG_IMAGE } from "@/lib/og";
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
} & Pick<ReplyLetter, "canRequestPhysical" | "myPhysicalRequest">;

/** 토큰이 있으면 서버가 isAuthor 를 계산해 준다(작성자 ID 는 내려오지 않는다) */
async function getLetter(letterId: string, token?: string): Promise<Letter | null> {
  // 없는 편지(400·404)만 null. 서버 오류는 throw → error.tsx 다시 시도 화면(가짜 "없음"·"답장 0통" 방지)
  const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`letter fetch ${response.status}`);
  const { data } = await response.json();
  return { ...data, authorSettings: data.authorSettings || { allowPhysicalRequests: true } };
}

export async function generateMetadata({ params }: { params: Promise<{ letterId: string }> }): Promise<Metadata> {
  const { letterId } = await params;
  const letter = await getLetter(letterId);

  if (!letter) {
    return { title: "편지를 찾을 수 없습니다" };
  }

  // 본문 앞 2줄 → 미리보기 설명(저장된 미리보기가 없을 때)
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
  const title = (letter.replyTo && `‘${letter.replyTo.title || "사연"}’에 온 답장`) || (letter.type === "story" && letter.title) || letter.ogTitle || letter.title || "당신에게 도착한 편지";
  // OG 이미지는 항공우편 봉투 한 장(정적). 제목·첫 줄은 카톡·SNS 가 이미지 아래에 따로 보여준다
  const ogImageUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}${OG_IMAGE}`;
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
      getStoryReplies(letterId).then((r) => r.data),
      getComments(letterId, 1, token).then((r) => r.data).catch(() => ({ items: [], total: letter.commentCount ?? 0, hasNextPage: false })),
    ]);
    return <StoryDetail story={letter} replies={replies} comments={comments} />;
  }

  // 사연에 단 답장: 읽기 화면. 원래 사연을 남긴 본인에게만 서버가 canRequestPhysical(레터 답장·채택)과 내 신청을 준다
  if (letter.replyTo) {
    return <ReplyDetail reply={{ ...letter, replyTo: letter.replyTo }} />;
  }

  return <FriendDetail letter={letter} />;
}
