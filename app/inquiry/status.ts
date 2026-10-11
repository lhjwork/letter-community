/** 문의 상태 배지 (목록·상세 공용) */
export const INQUIRY_STATUS = {
  open: { text: "답변 기다림", bg: "bg-ink-3" },
  answered: { text: "답변 완료", bg: "bg-approve" },
} as const;
