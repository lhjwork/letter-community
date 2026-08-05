# Letterway AI Chatbot 통합 기획서

> 작성일: 2026-05-16
> 대상 프로젝트: `letter-community` (Next.js 16, Vercel AI SDK + **Anthropic Claude**)
> 컨셉: **감정 동행형 AI**, 손편지 감성을 해치지 않는 잔잔한 보조자
>
> **변경 이력**
> - 2026-05-16 v1.1: LLM 백본을 Google Gemini → Anthropic Claude로 전환 (신규 API 키 발급)
> - 2026-05-16 v1.2: **$5 예산 MVP 모드 추가** (§0 참조). 1~11장은 v1.0 풀 로드맵으로 유지

---

## 0. ⚡ $5 MVP Quickstart (먼저 읽기)

> **이 섹션이 우선합니다.** 아래 11장은 풀 로드맵이지만, 실제 첫 출시는 본 섹션의 좁은 범위로 진행.

### 0.1 검증 가설 (1개만)

> "AI가 편지 작성 중 다음 문장을 살짝 제안할 때, 사용자는 손편지 감성을 해치지 않으며 더 길고 깊은 편지를 쓰는가?"

이 가설이 참이면 나머지 9개 기능 확장. 거짓이면 톤·UX 재설계.

### 0.2 MVP 범위 (10개 → 1개)

| 기능 | 포함 여부 | 사유 |
|---|---|---|
| **기능 1: 편지 작성 도우미** | ✅ 유일하게 진행 | 가장 직접적인 가치 검증 |
| 기능 2~10 | ⏸ 보류 | MVP 검증 후 단계적 확장 |
| 임베딩 / 매칭 | ⏸ 보류 | 별도 키 + 인프라 비용 |
| 위험 감지 | ⚠ 키워드 기반만 운영 | 베타 사용자 소수라 LLM 미사용 |

→ MVP는 사실상 "스마트한 자동완성" 한 개.

### 0.3 $5로 가능한 호출 수 (Claude Haiku 4.5 + Prompt Caching)

**가정**: 작성 도우미 1회 호출 = 시스템 프롬프트 800토큰(캐시) + 사용자 입력 150토큰 + 응답 60토큰

```
캐시 read:   800 × $0.10/1M = $0.00008
일반 input:  150 × $1.00/1M = $0.00015
output:       60 × $5.00/1M = $0.00030
────────────────────────────────────
호출당 비용: ≈ $0.00053
$5 예산 ÷ $0.00053 ≈ 9,400회
```

| 시나리오 | 호출 가능량 |
|---|---|
| 베타 5명 × 일 30회 × 30일 = 4,500회 | ✅ 여유 $2 잔여 |
| 베타 10명 × 일 30회 × 30일 = 9,000회 | ⚠ 한계 직전 |
| 베타 20명 × 일 30회 × 30일 = 18,000회 | ❌ 예산 초과 ($9.5) |

**결론**: **베타 사용자 10명 + 일 30회 캡** 권장.

### 0.4 Hard Limits (예산 보호 4중 장치)

```
[1] Per-user rate limit
    Vercel KV로 사용자별 일일 카운터
    초과 시 "오늘은 잠시 쉴게요" 메시지

[2] Global daily cap
    전체 일 1,500회 → 초과 시 AI 기능 자동 OFF

[3] Spend alert (Anthropic Console)
    $2.50 도달 시 Slack/이메일 알림
    $4.50 도달 시 긴급 알림

[4] Kill switch (환경변수)
    AI_ENABLED=false 한 줄로 즉시 차단
    Fallback: 기존 categoryClassifier.ts 키워드 기반으로 자연스럽게 degrade
```

### 0.5 모델 & 구현 최소 사양

| 항목 | 선택 | 이유 |
|---|---|---|
| 모델 | `claude-haiku-4-5` only | 최저 비용 |
| max_tokens | **60** (강제) | 한 문장만 — 비용 + 톤 제어 |
| Prompt caching | **필수** | 800토큰 시스템 프롬프트 캐시 90% 절감 |
| Streaming | ❌ 사용 안 함 | 짧은 응답이라 불필요, 단순 구현 |
| 백엔드 변경 | ❌ 없음 | Next.js API route만 추가 |
| DB 변경 | ❌ 없음 | 사용량 카운터는 Vercel KV |

### 0.6 1주 스프린트 (개발 1명 기준)

| Day | 작업 | 산출물 |
|---|---|---|
| Day 1 | `pnpm add @ai-sdk/anthropic`, ENV 셋업, kill switch 구현 | `lib/ai/client.ts`, `AI_ENABLED` 토글 |
| Day 2 | `lib/ai/prompts/writing-assist.ts` 작성 + 캐시 적용 | 캐시 적중 로그 확인 |
| Day 3 | `POST /api/ai/writing-assist` route, Zod 검증 | API 단독 테스트 (curl) |
| Day 4 | Vercel KV 연동, per-user/global rate limit | 한도 초과 시 503 응답 확인 |
| Day 5 | Tiptap Extension으로 인라인 제안 UI (Pattern A) | `/write`에서 작동 확인 |
| Day 6 | Spend alert 셋업, 베타 사용자 초대 메일 | 베타 10명 confirm |
| Day 7 | 릴리즈 + 피드백 채널 (Discord/노션 폼) | Day 7 저녁 출시 |

### 0.7 측정 지표 (최소)

| 지표 | 측정 방법 | 합격선 |
|---|---|---|
| **수락률** = 제안 채택 / 제안 노출 | 클라이언트 이벤트 로깅 | > 20% |
| **편지 평균 길이 변화** | DB before/after 비교 | +15% 이상 |
| **AI 끄기 비율** | 설정 토글 추적 | < 30% |
| **정성 피드백** | 베타 10명 1:1 인터뷰 | "방해 안 됨" 70% 이상 |
| **실제 지출** | Anthropic Console | $5 이내 |

### 0.8 검증 결과별 다음 액션

```
수락률 > 30% & 길이 +20% & 끄기 < 20%
  → 🟢 성공. 기능 2(일일 질문) + 6(감정 분석) 추가 진행

수락률 15~30% & 끄기 < 30%
  → 🟡 조건부 성공. 프롬프트 톤 재조정 후 2주 더 관찰

수락률 < 15% 또는 끄기 > 40%
  → 🔴 가설 기각. AI 형태 재설계 (예: 자동 제안 X, 명시적 호출만)
```

### 0.9 절대 하지 말 것 (MVP 한정)

- ❌ Sonnet/Opus 사용 (예산 즉사)
- ❌ 임베딩·매칭 기능 추가
- ❌ 대화형 챗봇 UI (스트리밍, 멀티턴)
- ❌ 사용자 인증 없이 공개 (rate limit 우회 위험)
- ❌ Prompt caching 미적용 (한 번에 예산 5배 증가)
- ❌ "베타 100명까지 늘려보자" — Hard limit 위반

### 0.10 MVP 성공 후 점진적 확장 비용

| 단계 | 추가 기능 | 예상 월 비용 (베타 10명 → 정식 500명) |
|---|---|---|
| MVP (현재) | 기능 1 | $5 |
| 검증 후 +1주 | 기능 2 (일일 질문) | +$2 |
| 검증 후 +2주 | 기능 6 (감정 분석) | +$15 |
| 정식 출시 (500 MAU) | 기능 1·2·6·9 | ~$50 |
| 1000 MAU | + 기능 3·5 (Sonnet 일부) | ~$160 |

→ MVP 성공 시 정식 출시까지의 비용 곡선은 가파르지 않음. 그러나 무료 한도가 끝나는 시점에 **유료 전환 또는 수익 모델**이 반드시 준비되어 있어야 함.

---

---

## 1. 기획 의도 요약

### 1.1 핵심 원칙
Letterway의 AI는 "**해결자**"가 아니라 "**조용한 동행자**"다.
기존 letter-community의 손편지 감성(NanumJangMiCe 폰트, 8개 카테고리 컬러 시스템, 익명 편지)을 **확장**하되, 결코 덮어쓰지 않는다.

| 일반 챗봇 (지양) | Letterway AI (지향) |
|---|---|
| 빠른 응답, 명확한 답 | 여백 있는 한 줄, 잔잔한 반응 |
| 풍부한 UI (말풍선, 아이콘) | 종이 위 작은 메모처럼 |
| "도와드릴게요!" 톤 | "그런 날이 있죠." 톤 |
| 즉시 결과 표시 | 천천히 타이핑되는 느낌 |

### 1.2 차별화 포인트
- **Anti-Chatbot UX**: 챗봇처럼 보이지 않는 챗봇
- **편지 흐름 안에 녹은 AI**: 별도 채널이 아닌 작성/읽기 화면 안에 자연스럽게 스며듦
- **8개 카테고리 감정 시스템 활용**: 기존 `categoryTheme.ts`의 컬러/이모지를 AI 분석 결과 표시에 재사용

---

## 2. 디자인 방향

### 2.1 톤 & 무드 (Visual)

**기본 원칙: "편지지 위의 연필 자국"**

```
✅ 채택               ❌ 지양
─────────────────    ─────────────────
손글씨 폰트 유지      말풍선 UI
얇은 회색 선          그라데이션 버튼
모노톤 + 카테고리 컬러  네온/비비드 컬러
페이드 인 (300ms+)    스프링 애니메이션
타이핑 효과 (40ms/char) 즉시 표시
서브틀 그림자        강한 그림자
```

### 2.2 컬러 팔레트 (AI 전용)

기존 `globals.css`의 oklch 변수 체계를 그대로 따르되, AI UI에는 다음을 사용:

| 용도 | 토큰 | 값 (Light) | 값 (Dark) |
|---|---|---|---|
| AI 배경 | `--ai-surface` | `oklch(0.985 0.005 240)` (아주 옅은 잉크블루) | `oklch(0.22 0.01 240)` |
| AI 텍스트 | `--ai-foreground` | `oklch(0.45 0 0)` (먹색) | `oklch(0.75 0 0)` |
| AI 액센트 | `--ai-accent` | `oklch(0.6 0.04 250)` (새벽 푸른빛) | `oklch(0.7 0.06 250)` |
| AI 구분선 | `--ai-border` | `oklch(0.9 0 0 / 0.4)` (점선) | `oklch(0.4 0 0 / 0.4)` |

**카테고리 감정 시각화**: 기존 `lib/categoryTheme.ts`의 8색을 재사용
→ 신규 컬러 추가 없이 시각적 일관성 유지

### 2.3 타이포그래피

| 요소 | 폰트 | 크기 | 행간 |
|---|---|---|---|
| AI 본문 | NanumJangMiCe (기존) | 14px | 24px |
| AI 라벨 | NanumJangMiCe | 12px | 18px |
| 강조 | 동일 폰트, italic | - | - |

→ **신규 폰트 추가 금지**. 손편지 일관성 유지.

### 2.4 컴포넌트 디자인 패턴

#### Pattern A: "여백의 한 줄" (Inline AI Hint)
```
편지 본문 영역
─────────────────────────
오늘은 비가 왔다.

  ✎ 누군가에게 한 문장만 남길 수 있다면? (AI · 옅게 표시)
```
- 본문 사이에 회색 점선 위 한 줄
- 클릭 시 본문에 삽입
- 5초 후 자동 페이드아웃

#### Pattern B: "조용한 분석 뱃지" (Emotion Badge)
```
🌧 외로움 72%  · 🌙 새벽 감성  · 🫧 잔잔함
```
- 편지 하단 우측, 작은 글씨
- 카테고리 이모지 + 강도(%)만
- 그래프/차트 없음

#### Pattern C: "떠도는 메모" (Floating Letter Status)
```
─ ─ ─ ─ ─ ─ ─ ─ ─ ─
당신의 편지는
비 오는 도시 근처를
떠돌고 있어요.
─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```
- 점선 박스, 중앙 정렬
- 영화 자막처럼 표시
- 진행률/숫자 없음

#### Pattern D: "조용한 대화" (Chat Mode)
- 일반 챗봇 UI 대신 **편지 양식의 짧은 응답 카드**
- 한 화면에 최대 3개 메시지만 표시 (스크롤 압박 제거)
- "보내기" 버튼 대신 "남기기" 라벨

### 2.5 모션 가이드

| 동작 | 듀레이션 | 이징 |
|---|---|---|
| AI 응답 페이드인 | 600ms | ease-out |
| 타이핑 효과 | 40ms/char | linear |
| 감정 뱃지 등장 | 800ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 떠도는 편지 글자 | 1200ms | ease-in-out |

→ **빠른 애니메이션 금지**. 사용자가 "기다림"을 느끼게 한다.

---

## 3. 전체 시스템 아키텍처

### 3.1 통합 구조도

```
┌─────────────────────────────────────────────────┐
│ Next.js 16 App Router (기존)                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  app/                                            │
│  ├── (afterLogin)/write       ← AI 작성 도우미   │
│  ├── (afterLogin)/letter-box  ← 감정 아카이브    │
│  ├── (afterLogin)/home        ← 매칭 추천        │
│  ├── letter/[id]              ← 감정 분석/답장  │
│  └── api/ai/                                     │
│      ├── generate-title       (기존)             │
│      ├── writing-assist       ◀ NEW (1)         │
│      ├── daily-prompt         ◀ NEW (2)         │
│      ├── emotion-chat         ◀ NEW (3)         │
│      ├── match-letters        ◀ NEW (4)         │
│      ├── reply-suggest        ◀ NEW (5)         │
│      ├── emotion-analyze      ◀ NEW (6)         │
│      ├── drift-narrative      ◀ NEW (7)         │
│      ├── content-recommend    ◀ NEW (8)         │
│      ├── safety-detect        ◀ NEW (9)         │
│      └── emotion-archive      ◀ NEW (10)        │
│                                                  │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ AI Service Layer (신규)                          │
│                                                  │
│  lib/ai/                                         │
│  ├── prompts/         ← 10개 System Prompt 모음 │
│  ├── client.ts        ← Gemini 클라이언트 통합   │
│  ├── streaming.ts     ← Vercel AI SDK 스트리밍  │
│  ├── safety.ts        ← 위험 감지 미들웨어       │
│  └── cache.ts         ← 응답 캐싱 (감정 키워드)  │
│                                                  │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ Backend (기존 MongoDB/Express)                   │
│                                                  │
│  추가 컬렉션:                                    │
│  - emotion_logs       (10번 아카이브용)          │
│  - letter_embeddings  (4번 매칭용 벡터)          │
│  - safety_flags       (9번 위험 감지)            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 3.2 기술 스택 (기존 확장)

| 영역 | 기존 | 변경 후 |
|---|---|---|
| LLM (속도) | Gemini 1.5 Flash | **Claude Haiku 4.5** (작성 도우미, 질문, 떠도는 편지, 안전 감지) |
| LLM (감성) | - | **Claude Sonnet 4.6** (대화, 답장, 감정 분석, 추천) |
| LLM (심층) | - | **Claude Opus 4.7** (월간 감정 아카이브 요약 — 호출 빈도 낮음) |
| SDK | Vercel AI SDK 5.0 | 동일 + `@ai-sdk/anthropic` 패키지 추가 |
| 프롬프트 캐싱 | 없음 | **Anthropic Prompt Caching** 필수 (10개 system prompt 캐시 → 입력 비용 90% 절감) |
| 임베딩 | 없음 | **Voyage AI** `voyage-3` 권장 (Anthropic 공식 파트너, 별도 키) <br> 또는 차선: Google `text-embedding-004` 유지 (Google 키 1개만 추가) |
| 벡터 DB | 없음 | MongoDB Atlas Vector Search (백엔드 변경 최소화) |
| 캐싱 (앱 레벨) | 없음 | Vercel KV (선택) 또는 in-memory |
| 기존 마이그레이션 | `/api/ai/generate-title` (Gemini) | **Claude Haiku 4.5로 교체** (Phase 1) |

**모델 선정 근거**
- **Haiku 4.5**: 응답 속도 < 300ms 목표 기능에 적합, $1/$5 per MTok (input/output)
- **Sonnet 4.6**: Claude의 시적·정서적 표현 강점 — Letterway 톤과 가장 잘 맞음, $3/$15
- **Opus 4.7**: 월 1회 호출되는 감정 아카이브에만 사용 (1M context로 사용자 전체 편지 일괄 분석)

**임베딩 선택 의사결정 트리**
```
Voyage AI 사용 가능? (별도 키, 무료 200M 토큰)
  ├─ YES → voyage-3 (1024차원, 비용 효율)
  └─ NO  → text-embedding-004 (Google 키 추가, 768차원)
            또는 Claude 자체 매칭 (LLM에 후보 N개 던지고 선택 — 비용 ↑)
```

### 3.3 응답 처리 패턴

| 기능 분류 | 응답 방식 | 모델 | 이유 |
|---|---|---|---|
| 작성 도우미, 답장 추천 | `generateObject` (구조화) | Haiku / Sonnet | 옵션 선택지 형태 |
| 감정 대화, 떠도는 편지 | `streamText` (스트리밍) | Sonnet / Haiku | 타이핑 효과 |
| 매칭, 추천 | 임베딩 + 비동기 잡 | Voyage/Google + Sonnet | 즉시성 불필요 |
| 감정 분석, 위험 감지 | `generateObject` + Tool Use | Sonnet / Haiku | 작성 직후 자동, 구조화 강제 |
| 월간 아카이브 | `generateText` (배치) | Opus | 1M context로 일괄 분석 |

### 3.4 Prompt Caching 전략 (Claude 핵심 기능)

**왜 필수인가**: 10개 system prompt는 각각 500~1500 토큰. 캐싱 없이는 매 호출마다 풀 비용. 캐싱 적용 시 입력 토큰 비용 **90% 절감**.

**적용 방법**
```typescript
// lib/ai/client.ts (의사 코드)
const response = await anthropic.messages.create({
  model: "claude-haiku-4-5",
  system: [
    {
      type: "text",
      text: SYSTEM_PROMPT_WRITING_ASSIST, // 캐시 대상
      cache_control: { type: "ephemeral" } // 5분 TTL
    }
  ],
  messages: [...]
});
```

**TTL 선택**
- `ephemeral` (5분): 작성 도우미, 감정 대화 — 연속 호출 빈번
- `1h` (1시간, beta): 일일 감정 질문, 떠도는 편지 — 시간대별 같은 prompt

**캐시 적중률 모니터링**: `usage.cache_read_input_tokens` 메트릭 추적 → 80%+ 목표

---

## 4. 10개 AI 기능 상세 기획

### 기능 1: AI 편지 작성 도우미

| 항목 | 내용 |
|---|---|
| 진입점 | `/write` 페이지 Tiptap 에디터 |
| UI 패턴 | Pattern A (여백의 한 줄) |
| 트리거 | 사용자 입력 3초 멈춤 시 |
| API | `POST /api/ai/writing-assist` |
| 응답 | 다음 문장 후보 2개 (선택형) |

**UX 시나리오**
```
사용자가 "오늘 비가 왔다." 쓰고 멈춤
  ↓ (3초 대기)
에디터 다음 줄에 옅게:
  "  ✎ '창문에 맺힌 빗방울을 한참 바라봤다.'"
  "  ✎ 다른 문장 보기 →"
  ↓
탭 키 누르면 삽입, ESC 누르면 사라짐
```

**구현 노트**
- 기존 `lib/ai-title-generator.ts` 패턴 재사용 (Gemini → Claude Haiku 4.5로 swap)
- Tiptap의 `Extension` API로 데코레이션 삽입
- 응답 200ms 이내가 핵심 (체감 속도) — Haiku 4.5 + prompt cache로 달성
- `max_tokens: 60`으로 강제 (한 문장만)

---

### 기능 2: 오늘의 감정 질문 AI

| 항목 | 내용 |
|---|---|
| 진입점 | `/home` 페이지 상단, `/write` 페이지 빈 화면 |
| UI 패턴 | Pattern B 변형 (큰 한 줄) |
| 트리거 | 페이지 진입, 새로고침 시 |
| API | `POST /api/ai/daily-prompt` |
| 응답 | 질문 1개 + "편지 쓰기" CTA |

**UX 시나리오**
```
/home 진입
  ↓
┌─────────────────────────────────────┐
│                                      │
│  오늘 가장 오래 남은 감정은          │
│  뭐였나요?                           │
│                                      │
│  · 편지로 남기기 →                   │
│                                      │
└─────────────────────────────────────┘
(점선 박스, 회색 톤)
```

**구현 노트**
- 시간대(새벽/낮/저녁) + 요일 컨텍스트 프롬프트 변수화
- 사용자별 최근 7일 감정 카테고리를 system prompt에 주입
- 응답 캐싱: 같은 사용자 + 같은 시간대 = 30분 캐시

---

### 기능 3: 감정 대화 AI

| 항목 | 내용 |
|---|---|
| 진입점 | `/letter-box` 우측 하단 작은 펜 아이콘 |
| UI 패턴 | Pattern D (조용한 대화) |
| 트리거 | 사용자가 펜 아이콘 클릭 |
| API | `POST /api/ai/emotion-chat` (스트리밍) |
| 응답 | 짧은 한두 줄 |

**UX 시나리오**
```
사용자: "오늘 좀 외로워요."
AI:     "그런 밤이 있죠."

사용자: "왜 아무 답이 없을까요."
AI:     "기다리는 시간은 유독 느리네요."
```

**구현 노트**
- 대화 히스토리 최대 5턴만 유지 (메모리 부담 ↓)
- "조언", "팁", "해결" 단어 출력 차단 (post-processing)
- 응답 길이 강제 제한: 30자 이내 (프롬프트 + 토큰 제한 둘 다)

---

### 기능 4: AI 편지 매칭 시스템

| 항목 | 내용 |
|---|---|
| 진입점 | `/home` 스토리 리스트, 편지 작성 완료 후 |
| UI 패턴 | Pattern C 변형 (떠도는 메모) |
| 트리거 | 작성 완료 직후 비동기 매칭 |
| API | `POST /api/ai/match-letters` |
| 응답 | 추천 편지 3개 + 감성 문구 |

**UX 시나리오**
```
작성 완료 후 잠시 뒤
  ↓
편지함에 알림 (소리/뱃지 X, 작은 점만)
  ↓
열어보면:

  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  비슷한 새벽을 지나던
  누군가의 편지예요.
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  [편지 미리보기 카드]
```

**구현 노트**
- 편지 작성 시 백엔드에서 임베딩 자동 생성 (text-embedding-004)
- MongoDB Atlas Vector Search로 cosine similarity 기반 검색
- 매칭 풀: 최근 30일 공개 편지 중 같은 카테고리 + 다른 작성자
- "매치 점수" 같은 숫자 절대 노출 금지

---

### 기능 5: AI 답장 추천

| 항목 | 내용 |
|---|---|
| 진입점 | `/letter/[id]` 편지 상세 페이지 하단 |
| UI 패턴 | Pattern A 변형 (3개 옵션 카드) |
| 트리거 | "답장하기" 버튼 클릭 시 |
| API | `POST /api/ai/reply-suggest` |
| 응답 | 3가지 톤의 답장 초안 |

**UX 시나리오**
```
편지 읽고 "답장하기" 클릭
  ↓
3개의 점선 카드 표시:

┌─────────────────┐
│ 따뜻한 답장      │
│ "편지를 읽고     │
│  한참 멈춰..."   │
└─────────────────┘

┌─────────────────┐
│ 담백한 답장      │
│ "조용히 마음에   │
│  남는 문장..."   │
└─────────────────┘

┌─────────────────┐
│ 시적인 답장      │
│ "누군가의 밤도   │
│  비슷했을..."    │
└─────────────────┘
  ↓
카드 선택 → 에디터에 삽입 (편집 가능)
```

**구현 노트**
- `generateObject` + Zod 스키마로 3개 톤 강제 (Claude Tool Use 기반)
- 원본 편지의 감정 분석 결과(기능 6)를 컨텍스트로 주입
- "답장 사용 시 표시 없음" - AI 작성 티 안 나게
- Sonnet 4.6 사용 — 시적·정서적 표현이 Letterway 톤과 가장 잘 맞음

---

### 기능 6: 감정 분위기 분석 AI

| 항목 | 내용 |
|---|---|
| 진입점 | 편지 작성 완료 시 자동 + 상세 페이지 표시 |
| UI 패턴 | Pattern B (조용한 분석 뱃지) |
| 트리거 | 편지 저장 시 백그라운드 |
| API | `POST /api/ai/emotion-analyze` |
| 응답 | 감정 키워드 + 강도 + 분위기 메타데이터 |

**UX 시나리오**
```
편지 상세 페이지 하단 우측 작게:

  🌧 외로움 72%  ·  🌙 새벽  ·  🫧 잔잔함

작성자 본인에게만 보이는 위치에도 표시:
"이번 편지엔 외로움이 가장 짙었어요."
```

**데이터 스키마 (Zod)**
```ts
const EmotionAnalysisSchema = z.object({
  primary_emotion: z.enum([
    "외로움", "그리움", "위로", "고백",
    "감사", "미련", "기쁨", "분노", "혼란"
  ]),
  intensity: z.number().min(0).max(100),
  mood: z.enum(["새벽", "낮", "저녁", "비", "맑음"]),
  texture: z.enum(["잔잔함", "거친", "따뜻함", "차가움"]),
  season: z.enum(["봄", "여름", "가을", "겨울"]).optional(),
  color_tone: z.enum(["바다", "노을", "안개", "별", "달"]).optional(),
});
```

**구현 노트**
- 기존 `categoryClassifier.ts`의 키워드 매칭과 **병행** (fallback)
- 결과는 letter 도큐먼트에 `aiMeta` 필드로 저장
- 사용자 본인에게만 강도 % 표시, 타인에게는 이모지만

---

### 기능 7: 떠도는 편지 AI 연출

| 항목 | 내용 |
|---|---|
| 진입점 | 편지 작성 직후, "내가 쓴 편지" 페이지 |
| UI 패턴 | Pattern C (떠도는 메모) |
| 트리거 | 작성 후 매 6시간마다 위치 변경 |
| API | `POST /api/ai/drift-narrative` |
| 응답 | 영화적 짧은 문장 1줄 |

**UX 시나리오**
```
내가 쓴 편지 카드 상단에:

  지금, 비 오는 도시 근처를 떠돌고 있어요.

(6시간 후 자동 변경)
  잠들지 못한 누군가가
  곧 발견할지도 모르겠어요.
```

**구현 노트**
- 편지 카테고리 + 시간대 + 날씨 API(선택) 조합
- 단어 풀: ["새벽", "지하철", "바다", "옥상", "골목", "공원", "카페"]
- Cron 또는 Vercel Cron으로 6시간마다 갱신
- 결과 캐싱으로 비용 절감

---

### 기능 8: 감정 기반 콘텐츠 추천 AI

| 항목 | 내용 |
|---|---|
| 진입점 | 편지 상세 페이지 하단 |
| UI 패턴 | Pattern B 확장 (작은 카드 1개) |
| 트리거 | 편지 작성 24시간 후 |
| API | `POST /api/ai/content-recommend` |
| 응답 | 콘텐츠 1개 + 한 줄 설명 |

**UX 시나리오**
```
편지 하단:

  ─────────────────────
  오늘 편지는 잔잔한 재즈
  같은 느낌이네요.

  · 빌 에반스 'Peace Piece'
  ─────────────────────
```

**구현 노트**
- 외부 API 연동 (Spotify, YouTube 검색 링크) 또는 큐레이션 DB
- MVP: LLM이 직접 추천 (할루시네이션 리스크 있음, 큐레이션 DB 권장)
- 추천 카테고리: 음악(우선), 영화, 책, 시 한 줄

---

### 기능 9: 위험 감정 감지 AI

| 항목 | 내용 |
|---|---|
| 진입점 | 모든 편지/대화 작성 시 **백그라운드** |
| UI 패턴 | 발견 시 차분한 안내 모달 |
| 트리거 | 작성 후 자동 |
| API | `POST /api/ai/safety-detect` |
| 응답 | 위험 레벨 + 안내 문구 |

**UX 시나리오**
```
위험 신호 감지 시:

  ┌────────────────────────────┐
  │                              │
  │  마음이 무거운 밤이네요.     │
  │                              │
  │  도움이 필요하면              │
  │  아래 연락처를 기억해주세요. │
  │                              │
  │  자살예방상담전화 1393         │
  │  정신건강위기상담 1577-0199    │
  │                              │
  │  · 알겠어요                   │
  │                              │
  └────────────────────────────┘

(편지 게시는 그대로 진행, 차단 X)
```

**구현 노트**
- 위험 레벨: `safe` / `attention` / `urgent`
- `urgent` 시 관리자 알림 큐에 추가 (백엔드)
- **절대 게시 차단 안 함** - 표현의 자유 보호
- 한국어 정신건강 키워드 사전 + LLM 이중 검증

---

### 기능 10: 감정 아카이브 AI

| 항목 | 내용 |
|---|---|
| 진입점 | `/letter-box` 또는 `/my-page` |
| UI 패턴 | Pattern B 시리즈 (월별 카드) |
| 트리거 | 사용자 진입 시 (주 1회 갱신) |
| API | `POST /api/ai/emotion-archive` |
| 응답 | 월별/주별 감정 요약 |

**UX 시나리오**
```
"이번 달의 마음"

  ─────────────────────────
  최근엔 외로움보다
  그리움이 자주 남아있었어요.
  ─────────────────────────

  ─────────────────────────
  새벽 시간의 기록이
  많아지고 있네요.
  ─────────────────────────

  ─────────────────────────
  조용한 바다 같은 문장이
  자주 보였어요.
  ─────────────────────────

(가로 스크롤 가능한 카드 3-5개)
```

**구현 노트**
- 기능 6의 `aiMeta`를 집계하여 사용 (재호출 비용 ↓)
- 월별 패턴 분석은 LLM 1회 호출 + 결과 저장
- "심리 분석" 단어 절대 사용 금지

---

## 5. 데이터 모델 변경사항

### 5.1 신규 컬렉션 (백엔드)

```typescript
// emotion_logs
{
  _id: ObjectId,
  userId: string,
  letterId: string,
  primary_emotion: string,
  intensity: number,
  mood: string,
  texture: string,
  createdAt: Date,
}

// letter_embeddings
{
  _id: ObjectId,
  letterId: string,
  embedding: number[], // 768차원 (text-embedding-004)
  category: string,
  isPublic: boolean,
  createdAt: Date,
}

// safety_flags
{
  _id: ObjectId,
  userId: string,
  letterId: string,
  level: 'safe' | 'attention' | 'urgent',
  detectedKeywords: string[],
  reviewStatus: 'pending' | 'reviewed' | 'dismissed',
  createdAt: Date,
}

// ai_conversations (기능 3 감정 대화)
{
  _id: ObjectId,
  userId: string,
  sessionId: string,
  messages: [{ role: 'user' | 'ai', content: string, timestamp: Date }],
  expiresAt: Date, // 7일 후 자동 삭제
}
```

### 5.2 기존 letters 컬렉션 확장

```typescript
{
  // ... 기존 필드
  aiMeta?: {
    emotionAnalysis?: EmotionAnalysis,  // 기능 6
    driftNarrative?: { text: string, updatedAt: Date }, // 기능 7
    contentRecommendation?: ContentRec, // 기능 8
    safetyLevel?: 'safe' | 'attention' | 'urgent', // 기능 9
  }
}
```

---

## 6. 구현 로드맵 (PDCA 기반)

### Phase 1: Foundation (1주차)
- [ ] `pnpm add @ai-sdk/anthropic @anthropic-ai/sdk` 설치
- [ ] `.env.local`에 `ANTHROPIC_API_KEY` 추가 (`GOOGLE_GENERATIVE_AI_API_KEY`는 임베딩 fallback용으로 유지)
- [ ] `lib/ai/` 디렉토리 구조 셋업
- [ ] System Prompt 10개 모듈화 (`lib/ai/prompts/*.ts`) — **각 prompt에 `cache_control` 마크 필수**
- [ ] Claude 통합 클라이언트 (`lib/ai/client.ts`) — 모델별 wrapper (haiku/sonnet/opus)
- [ ] 기존 `/api/ai/generate-title` 마이그레이션 (Gemini → Claude Haiku 4.5, 회귀 테스트)
- [ ] Safety 미들웨어 (기능 9 우선)
- [ ] 디자인 토큰 추가 (`--ai-*` 변수)
- [ ] Prompt cache 적중률 메트릭 대시보드 (간단한 console.log + 후속 Analytics)

### Phase 2: Core Writing Features (2주차)
- [ ] 기능 1: 편지 작성 도우미 (Tiptap 통합)
- [ ] 기능 2: 오늘의 감정 질문
- [ ] 기능 6: 감정 분위기 분석 (백그라운드)

→ **MVP 검증**: 작성 경험이 자연스러운가?

### Phase 3: Interaction (3주차)
- [ ] 기능 3: 감정 대화 AI (스트리밍)
- [ ] 기능 5: 답장 추천
- [ ] 기능 9: 위험 감지 (완전 통합)

### Phase 4: Community AI (4주차)
- [ ] 임베딩 파이프라인 구축
- [ ] MongoDB Atlas Vector Search 셋업
- [ ] 기능 4: 편지 매칭

### Phase 5: Atmosphere (5주차)
- [ ] 기능 7: 떠도는 편지 (Cron)
- [ ] 기능 8: 콘텐츠 추천
- [ ] 기능 10: 감정 아카이브

### Phase 6: Polish (6주차)
- [ ] 응답 캐싱 최적화
- [ ] 비용 분석 및 모델 다운그레이드 검토 (1.5 Flash → 2.0 Flash)
- [ ] A/B 테스트: AI 있을 때 vs 없을 때 체류 시간
- [ ] 사용자 피드백 수집 채널 구축

---

## 7. 비용 & 성능 고려사항

### 7.1 예상 비용 (월 1000 활성 사용자 기준, **Claude + Prompt Caching 적용**)

> 가정: 모든 system prompt에 cache_control 적용 → 입력 토큰 비용의 90%가 cache read ($0.10/$0.30/$1.50 per MTok)

| 기능 | 모델 | 호출/사용자/월 | 입력/출력 (캐시 후 실효) | 월 비용 (1000 MAU) |
|---|---|---|---|---|
| 작성 도우미 | Haiku 4.5 | 50 | 100/60 | ~$20 |
| 감정 질문 | Haiku 4.5 | 30 | 50/40 | ~$5 |
| 감정 대화 | Sonnet 4.6 | 20 (5턴) | 300/80 | ~$45 |
| 매칭 (임베딩) | Voyage-3 | 10 | 500 토큰 | ~$0.5 (무료 한도 내) |
| 답장 추천 | Sonnet 4.6 | 10 | 400/300 | ~$60 |
| 감정 분석 | Sonnet 4.6 | 30 | 200/150 | ~$80 |
| 떠도는 편지 | Haiku 4.5 | 40 (캐시) | 30/40 | ~$10 |
| 콘텐츠 추천 | Sonnet 4.6 | 10 | 150/200 | ~$35 |
| 안전 감지 | Haiku 4.5 | 50 | 200/30 | ~$12 |
| 월간 아카이브 | Opus 4.7 | 4 | 2000/500 | ~$60 |
| **합계** | - | - | - | **~$328/1000 MAU** |

**비용 비교 (참고)**
| 시나리오 | 1000 MAU 월 비용 |
|---|---|
| Gemini 2.0 Flash (v1.0) | ~$13 |
| Claude (캐싱 없음) | ~$3,200 |
| **Claude + Prompt Caching ✓** | **~$328** |
| Claude + Caching + Haiku 비중 ↑ | ~$180 (최적화 후 목표) |

→ 100만 MAU 시 약 $328,000/월. **수익 모델(프리미엄, 광고, B2B 감성 분석 API) 또는 모델 다운그레이드 필수**

**비용 최적화 액션 아이템**
1. Phase 6에서 Haiku로 충분한 기능을 모두 마이그레이션 (감정 대화 Sonnet → Haiku 실험)
2. Opus는 월간 아카이브에만 한정, 분기별로 빈도 조정
3. Prompt cache 적중률 90%+ 유지 (system prompt 변경 시 캐시 초기화 주의)
4. 무료 사용자: 기능 1·2·6만 / 프리미엄: 전체

### 7.2 응답 속도 목표

| 기능 | 목표 TTFB | 전략 |
|---|---|---|
| 작성 도우미 | < 300ms | 캐싱 + Flash 모델 |
| 감정 대화 | < 500ms | 스트리밍 |
| 감정 분석 | 백그라운드 | 사용자 대기 X |
| 매칭 | 백그라운드 | 알림으로 통보 |

---

## 8. 윤리 & 안전 가이드라인

### 8.1 절대 원칙
1. **위로하려 하지 않는다** (사용자의 감정을 침범하지 않음)
2. **진단하지 않는다** (의학/심리 용어 금지)
3. **연결을 강제하지 않는다** (매칭은 익명, 거리감 유지)
4. **데이터를 학습에 쓰지 않는다** (Google Gemini API 옵션 활용)
5. **위험 신호엔 침묵하지 않는다** (1393, 1577-0199 안내)

### 8.2 사용자 컨트롤
- 모든 AI 기능 개별 ON/OFF (설정 페이지)
- "AI 추천 받지 않기" 옵션
- 감정 분석 결과 비공개 옵션 (본인만 보기)

---

## 9. 측정 지표 (KPI)

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| 작성 완료율 (AI 도움 vs 없음) | +20% | A/B 테스트 |
| 평균 편지 길이 | +30% | DB 집계 |
| 답장률 (AI 추천 사용 시) | +40% | 이벤트 로깅 |
| 일일 체류 시간 | +25% | Analytics |
| 위험 신호 정확도 | 90%+ | 관리자 리뷰 |
| AI 응답 만족도 | 4.0/5.0 | 설문 |
| AI 비활성화율 | < 10% | 설정 추적 |

---

## 10. 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| AI가 너무 적극적이라 거부감 | Phase 2 후 사용자 인터뷰, 톤 다운 |
| Gemini API 응답 지연 | 캐싱 + 클라이언트 사이드 placeholder |
| 위험 신호 오탐 | 키워드 사전 + LLM 이중 검증 |
| 익명성 훼손 우려 | 임베딩에 작성자 ID 제거, 매칭 풀 다양화 |
| 비용 폭증 | Flash 모델 우선, Pro는 분석에만 |
| 상업 챗봇처럼 보임 | Pattern A-D 엄격 준수, 디자인 리뷰 필수 |

---

## 11. 다음 액션

기획자 입장의 즉시 결정 사항:

1. **MVP 범위 확정**: 10개 기능 중 어떤 3개로 시작할지 (추천: 1, 2, 6)
2. **디자인 시안 발주**: Pattern A-D의 Figma 시안 (특히 색상/여백)
3. **백엔드 협의**: MongoDB Atlas Vector Search 도입 여부
4. **법무 검토**: 감정 데이터 수집 약관, 위험 감지 시 대응 프로토콜
5. **베타 테스터 모집**: 새벽 시간대 활성 사용자 50명

개발자 입장의 즉시 결정 사항:

1. `lib/ai/` 폴더 구조 코드리뷰
2. Tiptap Extension API로 Pattern A 구현 PoC (Claude Haiku 4.5 + streaming)
3. 기존 `/api/ai/generate-title`을 Claude 기반으로 마이그레이션 + 회귀 테스트
4. **Anthropic API 키 환경 분리**: `.env.local`(개발) / Vercel env(프로덕션) — 절대 커밋 금지
5. Prompt Caching 적중률 측정 코드 삽입 (`usage.cache_read_input_tokens` 로깅)
6. 임베딩 전략 결정: Voyage AI 키 발급 vs Google 키 유지
7. **Rate Limiting 검토**: Anthropic API의 tier별 RPM 한계 확인 (Tier 1 → Tier 2 업그레이드 필요 시점)

**참고: 마이그레이션 예시 코드 (기존 `generate-title`)**
```typescript
// AS-IS (Gemini)
import { google } from "@ai-sdk/google";
const result = await generateObject({
  model: google("gemini-1.5-flash"),
  schema: TitleSchema,
  prompt: ...
});

// TO-BE (Claude Haiku 4.5 + Prompt Caching)
import { anthropic } from "@ai-sdk/anthropic";
const result = await generateObject({
  model: anthropic("claude-haiku-4-5"),
  schema: TitleSchema,
  system: [
    { type: "text", text: TITLE_SYSTEM_PROMPT,
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } }
  ],
  prompt: letterContent,
});
```

---

> **마무리 한 줄**
> Letterway의 AI는 "기능"이 아니다.
> 새벽에 옆에 앉아주는 누군가의 기척이다.
