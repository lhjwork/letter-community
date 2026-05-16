/**
 * 편지 작성 도우미 클라이언트 API
 */

export interface WritingAssistResponse {
  suggestion: string | null;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function fetchWritingSuggestion(
  content: string
): Promise<WritingAssistResponse> {
  try {
    const response = await fetch("/api/ai/writing-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { suggestion: null, error: data.error };
    }

    return data;
  } catch {
    return { suggestion: null, error: "네트워크 오류가 발생했습니다." };
  }
}
