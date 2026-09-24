/**
 * 감정 사전 자체 검증. 실행: npx tsx lib/emotion/lexicon.test.ts
 * ponytail: 테스트 프레임워크 없음 (프로젝트에 없어서). assert로 충분.
 */
import assert from "node:assert/strict";
import { detectEmotion, lastSentence, detectTimeline } from "./lexicon";

// 기본 감정 판별
assert.equal(detectEmotion("오늘 너무 슬퍼서 눈물이 났어").emotion, "sad");
assert.equal(detectEmotion("정말 행복하고 즐거운 하루였어!").emotion, "joy");
assert.equal(detectEmotion("사랑해, 너는 정말 소중한 사람이야").emotion, "love");
assert.equal(detectEmotion("진짜 짜증나고 화났어 최악이야").emotion, "angry");

// 마지막 문장만 본다 (앞 문장 감정에 끌려가면 안 됨)
assert.equal(
  detectEmotion("어제는 정말 슬펐어. 그런데 오늘은 너무 행복하고 즐거워!").emotion,
  "joy",
);

// 키워드 1개로도 반응한다
assert.equal(detectEmotion("조금 슬퍼").emotion, "sad");
assert.equal(detectEmotion("이별의 순간이 다가 왔다고 생각했습니다.").emotion, "sad");
// 감탄부호만으로는 반응하지 않는다
assert.equal(detectEmotion("그런데!!!").emotion, "neutral");

// 애매한 표현은 감정을 주장하지 않는다
const hedged = detectEmotion("슬픈 것 같기도 하고 눈물이 아마 날 것 같아");
assert.equal(hedged.emotion, "neutral", "hedge가 intensity를 깎아야 함");

// 감정 없는 문장
assert.equal(detectEmotion("어제 마트에 가서 우유를 샀다").emotion, "neutral");
assert.equal(detectEmotion("").intensity, 0);
assert.equal(detectEmotion("ㅇ").intensity, 0);

// 종결부호 없는 타이핑 중 문장도 처리
assert.equal(lastSentence("첫 문장이야. 지금 쓰는 중인 두 번째"), "지금 쓰는 중인 두 번째");
assert.equal(lastSentence("부호 없는 한 줄"), "부호 없는 한 줄");

// 읽기 모드 타임라인: 문장 수만큼 나온다
const tl = detectTimeline("슬퍼서 눈물이 났어. 그래도 행복하고 즐거워! 우유를 샀다.");
assert.equal(tl.length, 3);
assert.deepEqual(tl.map((t) => t.emotion), ["sad", "joy", "neutral"]);

console.log("✅ lexicon: 모든 검증 통과");
