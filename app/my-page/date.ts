/** 닉네임 변경 간격. 백엔드 userService NAME_CHANGE_INTERVAL_MS 와 같은 값 */
export const NAME_CHANGE_MS = 30 * 24 * 60 * 60 * 1000;

/** "2026. 9. 2." (서울 기준) */
export const ymd = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });

/** "11월 2일" (서울 기준) */
export const md = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" });
