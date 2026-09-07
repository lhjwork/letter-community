/** http(s) 스킴만 허용. javascript:/data: 등은 "#" 로 무력화 */
export function safeHttpUrl(url: unknown): string {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : "#";
}
