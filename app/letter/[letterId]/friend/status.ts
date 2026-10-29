/** 신청한 편지의 requestId 를 브라우저에 남겨 두는 키(예전 화면과 같은 키라 기존 신청도 이어진다) */
export const requestKey = (letterId: string) => `physicalRequest_${letterId}`;

/** 날짜 표기(서울 시간). format.dateTime 에 넘긴다 */
export const LONG_DATE = { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" } as const;
