import type { Correction } from "./proofread-types";

/** 에디터 HTML → 모델에 줄 평문. 문단 경계는 줄바꿈으로 남긴다. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** 모델 결과 중 원문(HTML)에 실제로 존재하고 실제로 바뀌는 것만 남긴다. */
export function filterCorrections(html: string, corrections: Correction[]): Correction[] {
  const seen = new Set<string>();
  return corrections.filter((c) => {
    const o = c.original.trim();
    if (!o || o === c.corrected.trim() || !html.includes(o) || seen.has(o)) return false;
    seen.add(o);
    return true;
  });
}

/** 선택한 교정을 HTML에 적용. 각 original은 첫 번째 등장만 바꾼다(중복 오류는 항목이 따로 온다). */
export function applyCorrections(html: string, corrections: Correction[]): string {
  return corrections.reduce((acc, c) => acc.replace(c.original, c.corrected), html);
}

