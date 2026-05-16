/**
 * 오늘의 감정 질문 클라이언트 API
 */

export interface DailyPromptResponse {
  question: string | null;
  error?: string;
}

export async function fetchDailyPrompt(): Promise<DailyPromptResponse> {
  try {
    const response = await fetch("/api/ai/daily-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { question: null, error: data.error };
    }

    return data;
  } catch {
    return { question: null, error: "네트워크 오류가 발생했습니다." };
  }
}
