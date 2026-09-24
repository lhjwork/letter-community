/**
 * 문장 감정 추정 (L1: 사전 기반, 0ms / 0원)
 *
 * ponytail: 키워드 사전. 문맥·반어법 못 잡음.
 * 업그레이드 경로 = Haiku 호출(L2)로 보정 — AI 크레딧 복구 후
 * app/api/ai/emotion/route.ts 추가해서 이 결과를 덮어쓰면 됨.
 */

export type Emotion = "joy" | "sad" | "love" | "angry" | "surprise" | "neutral";

export interface EmotionResult {
  emotion: Emotion;
  /** 0~1. THRESHOLD 미만이면 캐릭터는 idle 유지 (오판 시 사용자 기분 상함 방지) */
  intensity: number;
}

/** 감정별 키워드. 어간만 적어서 활용형을 커버한다 (기뻤 / 기쁘 / 기뻐 → "기쁘"는 못 잡으니 어간 변형을 나열) */
const LEXICON: Record<Exclude<Emotion, "neutral">, string[]> = {
  joy: ["기뻐", "기쁘", "기뻤", "행복", "즐거", "즐겁", "웃", "신나", "좋아", "좋았", "설레", "고마", "감사", "축하", "최고", "다행", "뿌듯", "ㅋㅋ", "ㅎㅎ", "😊", "😄", "🎉"],
  sad: ["슬퍼", "슬프", "슬펐", "눈물", "울었", "울고", "우울", "외로", "그리워", "그립", "보고싶", "아프", "아팠", "힘들", "지쳐", "지쳤", "미안", "후회", "이별", "떠나", "혼자", "죽", "ㅠㅠ", "ㅜㅜ", "😢", "😭"],
  love: ["사랑", "좋아해", "보고 싶", "소중", "고백", "설렘", "평생", "함께", "곁에", "품", "따뜻", "❤️", "💕"],
  angry: ["화가", "화났", "짜증", "싫어", "싫다", "밉", "억울", "분하", "최악", "지긋지긋", "😡", "🤬"],
  surprise: ["깜짝", "놀랐", "설마", "진짜?", "헐", "대박", "믿을 수 없", "어떻게 이런", "😮", "😱"],
};

/** 감정 단정을 누그러뜨리는 표현 — 있으면 intensity를 깎는다 */
const HEDGES = ["아마", "인 것 같", "일지도", "그런가", "모르겠"];

const MAX_HITS = 2; // 키워드 1개 = 0.5(반응), 2개 이상 = 1.0
const THRESHOLD = 0.5; // 이 미만이면 neutral (hedge 걸리면 1개로는 반응 안 함)

/**
 * 마지막 문장의 감정을 추정한다.
 * @param text HTML이 아닌 평문. 여러 문장이면 마지막 문장만 본다.
 */
export function detectEmotion(text: string): EmotionResult {
  const sentence = lastSentence(text);
  if (sentence.length < 2) return { emotion: "neutral", intensity: 0 };

  let best: Emotion = "neutral";
  let bestHits = 0;

  for (const [emotion, keywords] of Object.entries(LEXICON)) {
    const hits = keywords.filter((k) => sentence.includes(k)).length;
    // 동점이면 먼저 선언된 감정이 이긴다 (LEXICON 순서 = 우선순위)
    if (hits > bestHits) {
      bestHits = hits;
      best = emotion as Emotion;
    }
  }

  if (bestHits === 0) return { emotion: "neutral", intensity: 0 };

  let intensity = Math.min(bestHits / MAX_HITS, 1);
  if (HEDGES.some((h) => sentence.includes(h))) intensity *= 0.5;

  // 확신 없으면 감정을 주장하지 않는다
  if (intensity < THRESHOLD) return { emotion: "neutral", intensity };

  return { emotion: best, intensity };
}

/** 마지막 문장 추출. 종결부호가 없으면(타이핑 중) 전체를 한 문장으로 본다. */
export function lastSentence(text: string): string {
  const parts = text.split(/(?<=[.!?。…])\s*|\n+/).filter((s) => s.trim());
  return (parts.at(-1) ?? text).trim();
}

/** 저장된 편지를 읽기 모드에서 재생하기 위한 문장별 감정 타임라인 */
export function detectTimeline(text: string): EmotionResult[] {
  return text
    .split(/(?<=[.!?。…])\s*|\n+/)
    .filter((s) => s.trim())
    .map((s) => detectEmotion(s));
}
