/** 실물 편지 신청 상태(백엔드 recipientAddresses.physicalStatus) → 화면 문구. 신청자·작성자·상태 페이지 공용 */
export const PHYSICAL_STATUS: Record<string, string> = {
  requested: "작성자의 승인을 기다려요",
  approved: "승인됐어요",
  rejected: "거절됐어요",
  writing: "손글씨로 옮기는 중이에요",
  sent: "우편으로 보냈어요",
  delivered: "도착했어요",
};

export const ENVELOPE_NAME: Record<string, string> = { seongsu: "성수", myeongdong: "명동", letter: "레터" };

/** 신청한 편지의 requestId 를 브라우저에 남겨 두는 키(예전 화면과 같은 키라 기존 신청도 이어진다) */
export const requestKey = (letterId: string) => `physicalRequest_${letterId}`;

export function formatKoDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" });
}
