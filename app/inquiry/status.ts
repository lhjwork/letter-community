import type { InquiryCategory } from "@/lib/api";

/** 문의 상태 배지 (목록·상세 공용). 문구는 inquiry.status.<상태> */
export const INQUIRY_STATUS = {
  open: { bg: "bg-ink-3" },
  answered: { bg: "bg-approve" },
} as const;

/** 분류 값(백엔드에 저장되는 한국어) → 문구 키 inquiry.categories.<키> */
export const CATEGORY_KEY: Record<InquiryCategory, "service" | "physical" | "account" | "etc"> = {
  "서비스 이용": "service",
  "실물 편지": "physical",
  계정: "account",
  기타: "etc",
};
