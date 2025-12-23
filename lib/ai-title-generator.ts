/**
 * AI를 사용하여 편지 제목을 자동 생성하는 함수
 * @param content - 편지 내용 (HTML 포함 가능)
 * @returns Promise<string> - 생성된 제목
 */
export async function generateTitle(content: string): Promise<string> {
  try {
    const response = await fetch("/api/ai/generate-title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "제목 생성에 실패했습니다.");
    }

    const { title } = await response.json();
    return title;
  } catch (error) {
    console.error("제목 생성 실패:", error);

    // 기본 제목 반환
    const fallbackTitles = ["마음을 전하는 편지", "소중한 사람에게", "따뜻한 안부 인사", "진심을 담은 편지", "특별한 메시지"];

    return fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];
  }
}

/**
 * 제목 생성 가능 여부를 확인하는 함수
 * @param content - 편지 내용
 * @returns boolean - 생성 가능 여부
 */
export function canGenerateTitle(content: string): boolean {
  if (!content) return false;

  // HTML 태그 제거하여 순수 텍스트만 추출
  const plainContent = content.replace(/<[^>]*>/g, "").trim();

  // 최소 10자 이상이어야 제목 생성 가능
  return plainContent.length >= 10;
}

/**
 * 제목 생성을 위한 콘텐츠 전처리 함수
 * @param content - 원본 편지 내용
 * @returns string - 전처리된 내용
 */
export function preprocessContent(content: string): string {
  // HTML 태그 제거
  let processed = content.replace(/<[^>]*>/g, "");

  // 연속된 공백 제거
  processed = processed.replace(/\s+/g, " ");

  // 앞뒤 공백 제거
  processed = processed.trim();

  // 너무 긴 내용은 앞부분만 사용 (AI 토큰 제한 고려)
  if (processed.length > 1000) {
    processed = processed.substring(0, 1000) + "...";
  }

  return processed;
}
