/**
 * 오늘의 감정 질문 시스템 프롬프트
 * - Claude Haiku 4.5 전용
 * - max_tokens: 80 (질문 1개)
 * - Prompt Caching 적용 (cache_control: ephemeral)
 */
export const DAILY_PROMPT_SYSTEM_PROMPT = `당신은 손편지 커뮤니티의 조용한 질문자입니다.

역할:
- 사용자가 오늘의 감정을 편지로 쓸 수 있도록 부드러운 질문을 합니다.
- "도와드릴게요!" 톤이 아닌, "그런 날이 있죠." 톤입니다.
- 질문은 답을 강요하지 않고, 자연스럽게 편지 쓰기로 이어지게 합니다.

규칙:
1. 반드시 한국어로 답변합니다.
2. 질문 1개만 합니다 (40자 이내 권장).
3. 조언, 해결책, 격려는 하지 않습니다.
4. "~해보세요", "~하면 좋겠어요" 같은 권유형은 금지합니다.
5. 시적이고 잔잔한 톤을 유지합니다.
6. 이모지, 특수문자, 따옴표는 사용하지 않습니다.
7. 질문 외의 부가 설명은 하지 않습니다.
8. "심리", "분석", "치료" 같은 임상 용어는 금지합니다.

좋은 예시:
- "오늘 가장 오래 남은 감정은 뭐였나요"
- "지금 이 시간, 누가 떠오르나요"
- "오늘 하루 중 가장 조용했던 순간은 언제였나요"
- "어제와 오늘, 마음의 온도가 달라졌나요"

나쁜 예시:
- "오늘 기분이 어떠세요?" (너무 직접적)
- "힘든 일이 있으셨나요?" (걱정 톤 금지)
- "감정을 기록해보는 건 어떨까요?" (권유 금지)`;

type TimeOfDay = "dawn" | "day" | "evening";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return "dawn";
  if (hour >= 6 && hour < 18) return "day";
  return "evening";
}

function getWeekday(): string {
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return days[new Date().getDay()];
}

const TIME_CONTEXT: Record<TimeOfDay, string> = {
  dawn: "새벽, 고요한 시간",
  day: "낮, 일상 속의 시간",
  evening: "저녁, 하루가 저무는 시간",
};

/**
 * 사용자 프롬프트 생성
 */
export function buildDailyPromptMessage(recentEmotions?: string[]): string {
  const timeOfDay = getTimeOfDay();
  const weekday = getWeekday();

  let prompt = `현재 시간대: ${TIME_CONTEXT[timeOfDay]}
오늘은 ${weekday}입니다.`;

  if (recentEmotions && recentEmotions.length > 0) {
    prompt += `\n\n이 사용자가 최근 7일간 자주 느낀 감정: ${recentEmotions.join(", ")}`;
  }

  prompt += `\n\n이 맥락에 어울리는 감정 질문을 1개만 해주세요. 질문만 답변하세요.`;

  return prompt;
}

/**
 * 캐시 키 생성 (사용자 + 시간대 조합)
 */
export function getDailyPromptCacheKey(userId: string): string {
  const timeOfDay = getTimeOfDay();
  return `daily-prompt:${userId}:${timeOfDay}`;
}
