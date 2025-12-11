import { Metadata } from "next";

type Props = {
  params: Promise<{ letterId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letterId } = await params;

  // 실제로는 백엔드에서 편지 정보를 가져와야 함
  // const letter = await fetchLetter(letterId);

  // Mock Data
  const letter = {
    title: "특별한 편지가 도착했습니다",
    description: "소중한 마음을 전하는 편지입니다.",
    // 사용자가 커스텀한 OG 이미지가 있다면 그 URL을 사용하고, 없다면 동적 생성 API 사용
    ogImageUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/og?letterId=${letterId}`,
  };

  return {
    title: letter.title,
    description: letter.description,
    openGraph: {
      title: letter.title,
      description: letter.description,
      images: [
        {
          url: letter.ogImageUrl,
          width: 1200,
          height: 630,
          alt: letter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: letter.title,
      description: letter.description,
      images: [letter.ogImageUrl],
    },
  };
}

export default async function LetterPage({ params }: Props) {
  const { letterId } = await params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">편지 상세 페이지</h1>
        <p className="text-gray-600 mb-8">Letter ID: {letterId}</p>
        <div className="p-4 bg-blue-50 rounded-md text-blue-800 mb-8">이 페이지는 공유될 때 동적으로 생성된 OG 이미지를 보여줍니다.</div>
        <a href={`/letter/${letterId}/custom-og`} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          OG 이미지 꾸미러 가기
        </a>
      </div>
    </div>
  );
}
