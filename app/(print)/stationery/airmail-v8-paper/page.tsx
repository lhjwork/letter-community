import { AirmailV8Paper } from "@/components/stationery/AirmailV8";

/** 인쇄: Chrome "PDF로 저장"(여백 없음, 배경 그래픽 켬) 또는 README의 헤드리스 커맨드 */
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&display=block" precedence="default" />
      <AirmailV8Paper />
    </>
  );
}
