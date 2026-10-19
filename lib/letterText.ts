/** 예전 HTML(TipTap) 편지·임시저장을 본문 텍스트로. 응답 contentType 이 html 일 때만 부른다 */
export function htmlToText(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 읽기 화면 본문. 빈 줄 여러 개는 한 줄로(단락 사이 한 줄 간격) */
export function letterText(content: string, contentType?: "text" | "html") {
  const text = contentType === "html" ? htmlToText(content) : content;
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n\n");
}
