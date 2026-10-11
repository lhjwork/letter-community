import { EnvelopeSheet } from "@/components/stationery/EnvelopeSheet";

/** v8 봉투 인쇄 시트(원본 260930 명동 인쇄용과 같은 레이아웃). README의 헤드리스 커맨드로 PDF 출력 */
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&display=block" precedence="default" />
      <EnvelopeSheet kind="airmail-v8-envelope" />
    </>
  );
}
