import { Metadata } from "next";
import { notFound } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface Letter {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  ogPreviewMessage?: string;
  ogImageUrl?: string;
  ogImageType?: "auto" | "custom";
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

  const ogImageUrl =
    letter.ogImageUrl ||
    `${
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    }/api/og?letterId=${letterId}`;

  return {
    title: letter.ogPreviewMessage || letter.title || "당신에게 도착한 편지",
    description: "Letter Community에서 특별한 편지를 확인하세요",
    openGraph: {
      title: letter.ogPreviewMessage || letter.title || "당신에게 도착한 편지",
      description: "Letter Community에서 특별한 편지를 확인하세요",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: letter.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: letter.ogPreviewMessage || letter.title || "당신에게 도착한 편지",
      description: "Letter Community에서 특별한 편지를 확인하세요",
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

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 편지 내용 */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {letter.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>작성자: {letter.authorName}</span>
              <span>•</span>
              <span>
                {new Date(letter.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: letter.content }}
          />

          {/* OG 이미지 커스터마이징 버튼 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <a
              href={`/letter/${letterId}/custom-og`}
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              공유 이미지 커스터마이징 ✨
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
