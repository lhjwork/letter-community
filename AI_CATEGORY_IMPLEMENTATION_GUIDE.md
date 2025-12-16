# 🤖 AI 자동 분류 구현 가이드

Letter 서비스에 **Vercel AI SDK + Google Gemini**를 사용한 사연 자동 분류 기능을 추가하는 전체 가이드입니다.

---

## 📋 개요

### 기능

- 사연 작성 시 AI가 자동으로 카테고리 분류
- 8개 카테고리: 가족, 사랑, 우정, 성장, 위로, 추억, 감사, 기타
- 사연 목록에서 카테고리별 필터링
- 카테고리 뱃지 UI 표시

### 기술 스택

- **프론트엔드**: Next.js + Vercel AI SDK + Google Gemini
- **백엔드**: Node.js + Express + MongoDB
- **비용**: 완전 무료 (Google Gemini 무료 티어)

---

## 🎯 구현 순서

### 1단계: 프론트엔드 구현

👉 **문서**: `AI_CATEGORY_FRONTEND_PROMPT.md`

**작업 내용**:

1. Vercel AI SDK 패키지 설치
2. Google Gemini API 키 발급 및 설정
3. AI 분류 API Route 생성 (`/api/ai/categorize`)
4. 사연 작성 페이지에서 AI 분류 호출
5. 카테고리 테마 유틸리티 생성
6. 사연 목록에 카테고리 필터 및 뱃지 추가

**예상 소요 시간**: 1-2시간

---

### 2단계: 백엔드 구현

👉 **문서**: `AI_CATEGORY_BACKEND_PROMPT.md`

**작업 내용**:

1. Letter 모델에 `category`, `aiMetadata` 필드 추가
2. 사연 등록 API 수정 (카테고리 저장)
3. 사연 목록 API에 카테고리 필터 추가
4. 카테고리 통계 API 추가 (선택)
5. 기존 데이터 마이그레이션

**예상 소요 시간**: 1-2시간

---

## 💰 비용

### 완전 무료!

| 항목              | 비용                  |
| ----------------- | --------------------- |
| Vercel AI SDK     | ✅ 무료 (오픈소스)    |
| Google Gemini API | ✅ 월 100만 토큰 무료 |
| 사연 1개 분류     | ✅ 무료 (~200 토큰)   |
| 월 5,000개 사연   | ✅ 무료               |

**무료 한도**:

- 월 100만 토큰
- 분당 15 요청
- 일일 1,500 요청

---

## 🔑 API 키 발급

### Google Gemini API Key

1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 프로젝트 선택 또는 새로 생성
4. API 키 복사

**환경 변수 설정**:

```bash
# .env.local (프론트엔드)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

---

## 📊 데이터 구조

### Letter 모델 (MongoDB)

```javascript
{
  _id: ObjectId,
  type: "story" | "friend",
  title: String,
  content: String,
  authorName: String,

  // 🆕 AI 분류 필드
  category: "가족" | "사랑" | "우정" | "성장" | "위로" | "추억" | "감사" | "기타",

  // 🆕 AI 메타데이터
  aiMetadata: {
    confidence: Number,      // 0-1 사이 신뢰도
    reason: String,          // 분류 이유
    tags: [String],          // 관련 태그
    classifiedAt: Date,      // 분류 시각
    model: String,           // "gemini-1.5-flash"
  },

  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🎨 카테고리 정의

| 카테고리 | 설명                        | 이모지 | 색상   |
| -------- | --------------------------- | ------ | ------ |
| 가족     | 부모님, 형제자매, 가족 관계 | 👨‍👩‍👧‍👦     | 오렌지 |
| 사랑     | 연애, 짝사랑, 이별          | 💕     | 핑크   |
| 우정     | 친구, 동료 관계             | 🤝     | 블루   |
| 성장     | 자기계발, 극복, 성취        | 🌱     | 그린   |
| 위로     | 힐링, 공감, 응원            | 🫂     | 퍼플   |
| 추억     | 과거 회상, 그리움           | 📸     | 앰버   |
| 감사     | 고마움, 감사 표현           | 🙏     | 틸     |
| 기타     | 위 카테고리 외              | 📝     | 그레이 |

---

## 🔄 전체 플로우

```
1. 사용자가 사연 작성 완료
   ↓
2. 프론트엔드: POST /api/ai/categorize
   {
     title: "엄마에게",
     content: "엄마, 항상 고마워요..."
   }
   ↓
3. Vercel AI SDK → Google Gemini API 호출
   ↓
4. AI 응답
   {
     category: "가족",
     confidence: 0.95,
     reason: "가족에 대한 감사 표현",
     tags: ["엄마", "감사", "사랑"]
   }
   ↓
5. 프론트엔드: POST /api/letters
   {
     type: "story",
     title: "엄마에게",
     content: "...",
     category: "가족",
     aiMetadata: { ... }
   }
   ↓
6. 백엔드: MongoDB에 저장
   ↓
7. 사연 목록에서 "가족" 카테고리로 표시
```

---

## 🧪 테스트 시나리오

### 1. AI 분류 API 테스트

```bash
curl -X POST http://localhost:3000/api/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "엄마에게 보내는 편지",
    "content": "엄마, 항상 고마워요. 말로 표현하지 못했지만..."
  }'
```

**예상 결과**: `category: "가족"`

---

### 2. 사연 등록 테스트

1. `/write` 페이지 접속
2. "사연 (공개)" 선택
3. 제목: "엄마에게"
4. 내용: "엄마, 항상 고마워요..."
5. "사연 제출하기" 클릭
6. ✅ "사연이 '가족' 카테고리로 등록되었습니다!" 알림 확인

---

### 3. 카테고리 필터 테스트

1. `/stories` 페이지 접속
2. "가족" 카테고리 버튼 클릭
3. ✅ 가족 카테고리 사연만 표시 확인
4. 각 카드에 "👨‍👩‍👧‍👦 가족" 뱃지 표시 확인

---

## ✅ 체크리스트

### 프론트엔드

- [ ] `ai`, `@ai-sdk/google`, `zod` 패키지 설치
- [ ] Google Gemini API 키 발급
- [ ] `.env.local`에 API 키 추가
- [ ] `app/api/ai/categorize/route.ts` 생성
- [ ] `lib/categoryTheme.ts` 생성
- [ ] `app/(afterLogin)/write/page.tsx` 수정
- [ ] `lib/api.ts` 수정
- [ ] `app/stories/page.tsx` 수정
- [ ] 로컬 테스트 완료
- [ ] Vercel에 환경 변수 추가

### 백엔드

- [ ] Letter 모델에 `category` 필드 추가
- [ ] Letter 모델에 `aiMetadata` 필드 추가
- [ ] 복합 인덱스 추가
- [ ] POST /api/letters 수정
- [ ] GET /api/letters/stories 수정
- [ ] 기존 데이터 마이그레이션
- [ ] API 테스트 완료

---

## 🚀 배포

### Vercel 환경 변수 추가

1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 추가:
   ```
   Name: GOOGLE_GENERATIVE_AI_API_KEY
   Value: your-api-key-here
   Environment: Production, Preview, Development
   ```
5. 재배포:
   ```bash
   git commit --allow-empty -m "Add AI categorization"
   git push
   ```

---

## 🐛 문제 해결

### AI 분류가 작동하지 않는 경우

1. **API 키 확인**:

   ```bash
   echo $GOOGLE_GENERATIVE_AI_API_KEY
   ```

2. **API 호출 로그 확인**:

   ```javascript
   console.log("AI 분류 요청:", { title, content });
   console.log("AI 분류 응답:", result);
   ```

3. **에러 메시지 확인**:
   - "API key not valid" → API 키 재발급
   - "Rate limit exceeded" → 무료 한도 초과 (1분 대기)
   - "Model not found" → 모델명 확인 (`gemini-1.5-flash`)

---

### 카테고리가 항상 "기타"로 분류되는 경우

1. **프롬프트 확인**: AI에게 명확한 지시 전달
2. **내용 길이 확인**: 너무 짧으면 분류 어려움 (최소 20자)
3. **신뢰도 확인**: `confidence < 0.5`이면 "기타" 가능성 높음

---

### 백엔드에서 카테고리가 저장되지 않는 경우

1. **스키마 확인**: `category` 필드가 모델에 있는지 확인
2. **enum 확인**: 카테고리 값이 enum에 포함되는지 확인
3. **마이그레이션 실행**: 기존 데이터에 기본값 설정

---

## 📈 성능 최적화

### 1. 캐싱

```typescript
// 동일한 내용은 캐싱하여 API 호출 감소
import { unstable_cache } from "next/cache";

const getCachedCategory = unstable_cache(
  async (title, content) => {
    // AI 분류 로직
  },
  ["ai-category"],
  { revalidate: 3600 } // 1시간 캐시
);
```

### 2. 짧은 내용은 키워드 기반

```typescript
if (content.length < 50) {
  return keywordBasedClassification(title, content);
}
```

### 3. 배치 처리

```typescript
// 여러 사연을 한 번에 분류
const categories = await Promise.all(
  stories.map((story) => classifyStory(story.title, story.content))
);
```

---

## 📚 참고 문서

### 프론트엔드

- [AI_CATEGORY_FRONTEND_PROMPT.md](AI_CATEGORY_FRONTEND_PROMPT.md)
- [Vercel AI SDK 공식 문서](https://sdk.vercel.ai/docs)
- [Google Gemini API](https://ai.google.dev/docs)

### 백엔드

- [AI_CATEGORY_BACKEND_PROMPT.md](AI_CATEGORY_BACKEND_PROMPT.md)
- [Mongoose 스키마](https://mongoosejs.com/docs/guide.html)
- [MongoDB 인덱스](https://www.mongodb.com/docs/manual/indexes/)

---

## 🎉 완료 후 기대 효과

1. **사용자 경험 향상**: 원하는 카테고리의 사연을 쉽게 찾을 수 있음
2. **콘텐츠 발견성 증가**: 카테고리별 추천 가능
3. **데이터 분석**: 어떤 주제의 사연이 많은지 파악
4. **자동화**: 수동 분류 불필요

---

**구현 시작하세요!** 🚀

프론트엔드부터 시작하는 것을 추천합니다.
