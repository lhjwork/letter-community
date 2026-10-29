import { useTranslations } from "next-intl";

// ponytail: 백엔드(myRecordsService)가 라벨·배지·제목을 한국어로 만들어 보낸다. 백엔드가 코드값을 주게 바뀌면 이 표를 지운다
const LABEL: Record<string, string> = { "나의 사연": "myStory", "보낸 · 답장": "sentReply", "받은 · 사연 답장": "receivedReply", "보낸 · 마음 편지": "sentHeart", "받은 · 마음 편지": "receivedHeart" };
const BADGE: Record<string, string> = { 채택: "adopted", "검토 중": "reviewing", "레터의 답장": "fromLetter", "실물 신청됨": "physical", "답장 기다림": "waiting" };

/** 한국어 화면에서는 받은 값을 그대로, 그 밖에는 표에 있는 것만 바꾸고 모르는 값은 그대로 둔다 */
export function useRecordText() {
  const t = useTranslations("shared.record");
  return {
    label: (s: string) => (LABEL[s] ? t(`label.${LABEL[s]}`) : s),
    badge: (s: string) => {
      const n = /^답장 (\d+)$/.exec(s);
      return n ? t("badge.replies", { count: Number(n[1]) }) : BADGE[s] ? t(`badge.${BADGE[s]}`) : s;
    },
    title: (s: string) => {
      const m = /^‘(.*)’에 (쓴|온) 답장$/.exec(s);
      return m ? t(m[2] === "쓴" ? "title.wrote" : "title.received", { title: m[1] }) : s;
    },
  };
}
