import { AdPaper } from "@/components/stationery/ad/AdStationery";

/** 광고 시안 A 편지지. ?sample=1 이면 예시 손글씨가 들어간 미리보기, 없으면 인쇄용 빈 편지지 */
export default async function Page({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const { sample } = await searchParams;
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&display=block" precedence="default" />
      <AdPaper variant="a" sample={sample === "1"} />
    </>
  );
}
