import { AdEnvelope } from "@/components/stationery/ad/AdStationery";

/** 광고 시안 B 봉투 인쇄 시트 */
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&display=block" precedence="default" />
      <AdEnvelope variant="b" />
    </>
  );
}
