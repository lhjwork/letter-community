# 🎨 프론트엔드 AI 프롬프트 - 사연 자동 분류

## 📋 요구사항

Next.js 프로젝트에 **Vercel AI SDK + Google Gemini**를 사용하여 사연 자동 분류 기능을 구현해주세요.

---

## 🎯 구현할 기능

1. **AI 분류 API Route** 생성
2. **사연 작성 페이지**에서 AI 분류 호출
3. **카테고리 뱃지** UI 추가
4. **사연 목록 페이지**에 카테고리 필터 추가

---

## 📦 1단계: 패키지 설치

```bash
pnpm add ai @ai-sdk/google zod
```

---

## 🔑 2단계: 환경 변수 설정

### `.env.local` 파일에 추가

```bash
# Google Gemini API Key (무료)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

### `.env.example` 파일에 추가

```bash
# AI Category Classification
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
```

**API 키 발급 방법**:

1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 생성된 키를 `.env.local`에 추가

---

## 🤖 3단계: AI 분류 API Route 생성

### 파일: `app/api/ai/categorize/route.ts`

```typescript
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// 카테고리 스키마 정의
const categorySchema = z.object({
  category: z.enum([
    "가족",
    "사랑",
    "우정",
    "성장",
    "위로",
    "추억",
    "감사",
    "기타",
  ]),
  confidence: z.number().min(0).max(1).describe("분류 신뢰도 (0-1)"),
  reason: z.string().describe("카테고리 선택 이유"),
  tags: z.array(z.string()).max(5).describe("관련 태그 (최대 5개)"),
});

export const maxDuration = 30; // Vercel 타임아웃 설정

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    // 입력 검증
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "제목과 내용이 필요합니다",
        },
        { status: 400 }
      );
    }

    // 너무 짧은 내용은 기본 카테고리로
    if (content.length < 20) {
      return NextResponse.json({
        success: true,
        data: {
          category: "기타",
          confidence: 0.5,
          reason: "내용이 너무 짧아 자동 분류가 어렵습니다",
          tags: [],
        },
      });
    }

    // Google Gemini로 AI 분류 (무료!)
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: categorySchema,
      prompt: `
당신은 사연 분류 전문가입니다. 다음 사연을 분석하고 가장 적합한 카테고리를 선택해주세요.

## 카테고리 설명

- **가족**: 부모님, 형제자매, 가족 관계에 관한 이야기
- **사랑**: 연애, 짝사랑, 이별, 사랑에 관한 이야기
- **우정**: 친구, 동료와의 관계에 관한 이야기
- **성장**: 자기계발, 극복, 성취, 도전에 관한 이야기
- **위로**: 힐링, 공감, 응원이 필요한 이야기
- **추억**: 과거 회상, 그리움, 추억에 관한 이야기
- **감사**: 고마움, 감사 표현에 관한 이야기
- **기타**: 위 카테고리에 해당하지 않는 이야기

## 분석할 사연

**제목**: ${title}

**내용**: ${content}

## 분석 기준

1. 사연의 주요 감정과 주제를 파악하세요
2. 가장 핵심적인 카테고리 **1개만** 선택하세요
3. 신뢰도(confidence)는 0-1 사이 값으로 표현하세요
   - 0.8 이상: 매우 확실함
   - 0.6-0.8: 확실함
   - 0.4-0.6: 보통
   - 0.4 미만: 불확실함
4. 선택 이유를 한 문장으로 간단히 설명하세요
5. 관련 태그 3-5개를 추출하세요 (예: "엄마", "그리움", "사랑" 등)

한국어로 응답해주세요.
      `.trim(),
      temperature: 0.3, // 일관성 있는 분류를 위해 낮은 값
    });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error) {
    console.error("AI 분류 오류:", error);

    // 에러 시 기본 카테고리 반환
    return NextResponse.json(
      {
        success: false,
        error: "AI 분류에 실패했습니다",
        fallback: {
          category: "기타",
          confidence: 0,
          reason: "자동 분류 실패",
          tags: [],
        },
      },
      { status: 500 }
    );
  }
}
```

---

## ✍️ 4단계: 사연 작성 페이지 수정

### 파일: `app/(afterLogin)/write/page.tsx`

기존 `handleSubmit` 함수를 다음과 같이 수정:

```typescript
const handleSubmit = async () => {
  // 기존 유효성 검사
  if (!title.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!content.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }
  if (letterType === "story" && !author.trim()) {
    alert("작성자를 입력해주세요.");
    return;
  }

  setIsSubmitting(true);

  try {
    const token = session?.backendToken;
    const plainContent = content.replace(/<[^>]*>/g, "").trim();
    const ogPreviewText =
      plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

    let result: { data: { _id: string } } | undefined;

    if (letterType === "story") {
      // 🆕 1. AI로 카테고리 자동 분류
      let aiCategory = "기타";
      let aiMetadata = null;

      try {
        const categoryResponse = await fetch("/api/ai/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: plainContent,
          }),
        });

        const categoryResult = await categoryResponse.json();

        if (categoryResult.success) {
          aiCategory = categoryResult.data.category;
          aiMetadata = {
            confidence: categoryResult.data.confidence,
            reason: categoryResult.data.reason,
            tags: categoryResult.data.tags,
            classifiedAt: new Date().toISOString(),
            model: "gemini-1.5-flash",
          };
        } else if (categoryResult.fallback) {
          aiCategory = categoryResult.fallback.category;
        }
      } catch (error) {
        console.error("AI 분류 실패:", error);
        // AI 실패해도 계속 진행 (기본 카테고리 사용)
      }

      // 🆕 2. 사연 등록 (카테고리 포함)
      result = await createStory(
        {
          title: title.trim(),
          content: plainContent,
          authorName: author.trim(),
          ogTitle: title.trim(),
          ogPreviewText,
          category: aiCategory, // AI가 분류한 카테고리
          aiMetadata, // AI 메타데이터
        },
        token
      );

      alert(`사연이 "${aiCategory}" 카테고리로 등록되었습니다! 💌`);
    } else {
      // 편지 보내기 (기존 로직)
      result = await sendLetterToFriend(
        {
          receiverEmail: receiverEmail.trim(),
          title: title.trim(),
          content: plainContent,
          ogTitle: title.trim(),
          ogPreviewText,
        },
        token
      );
      alert(
        "편지가 성공적으로 전송되었습니다! 💌\n받는 사람에게 이메일이 발송됩니다."
      );
    }

    // 편지 상세 페이지로 이동
    if (result?.data?._id) {
      router.push(`/letter/${result.data._id}`);
    } else {
      router.push("/");
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert(
      error instanceof Error
        ? error.message
        : "등록에 실패했습니다. 다시 시도해주세요."
    );
  } finally {
    setIsSubmitting(false);
  }
};
```

**제출 버튼 텍스트 수정**:

```typescript
<button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting
    ? letterType === "story"
      ? "AI 분류 중..."
      : "전송 중..."
    : letterType === "story"
    ? "사연 제출하기"
    : "편지 보내기"}
</button>
```

---

## 🎨 5단계: 카테고리 테마 유틸리티 생성

### 파일: `lib/categoryTheme.ts`

```typescript
export const categoryThemes = {
  가족: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    emoji: "👨‍👩‍👧‍👦",
    gradient: "from-orange-400 to-red-400",
    description: "가족과의 소중한 이야기",
  },
  사랑: {
    color: "bg-pink-100 text-pink-800 border-pink-200",
    emoji: "💕",
    gradient: "from-pink-400 to-rose-400",
    description: "사랑과 연애 이야기",
  },
  우정: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    emoji: "🤝",
    gradient: "from-blue-400 to-cyan-400",
    description: "친구와의 우정 이야기",
  },
  성장: {
    color: "bg-green-100 text-green-800 border-green-200",
    emoji: "🌱",
    gradient: "from-green-400 to-emerald-400",
    description: "성장과 도전의 이야기",
  },
  위로: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    emoji: "🫂",
    gradient: "from-purple-400 to-indigo-400",
    description: "위로와 공감의 이야기",
  },
  추억: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    emoji: "📸",
    gradient: "from-amber-400 to-yellow-400",
    description: "추억과 그리움의 이야기",
  },
  감사: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    emoji: "🙏",
    gradient: "from-teal-400 to-cyan-400",
    description: "감사와 고마움의 이야기",
  },
  기타: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    emoji: "📝",
    gradient: "from-gray-400 to-slate-400",
    description: "다양한 이야기",
  },
} as const;

export type Category = keyof typeof categoryThemes;

export function getCategoryTheme(category: string) {
  return categoryThemes[category as Category] || categoryThemes["기타"];
}
```

---

## 📋 6단계: 사연 목록 페이지에 카테고리 표시

### 파일: `app/stories/page.tsx`

**카테고리 필터 추가**:

```typescript
import { getCategoryTheme } from "@/lib/categoryTheme";

// 상태 추가
const [categoryFilter, setCategoryFilter] = useState<string>("전체보기");

// 카테고리 목록
const categories = [
  "전체보기",
  "가족",
  "사랑",
  "우정",
  "성장",
  "위로",
  "추억",
  "감사",
  "기타",
];

// 필터링 함수
const handleCategoryFilter = async (category: string) => {
  setCategoryFilter(category);
  try {
    const response = await getStories({
      limit: 20,
      // TODO: 백엔드에 category 파라미터 추가 필요
    });
    setStories(response.data);
  } catch (error) {
    console.error("필터링 실패:", error);
  }
};
```

**카테고리 필터 UI**:

```tsx
{
  /* 카테고리 필터 */
}
<div className="flex items-center gap-2 overflow-x-auto pb-2">
  {categories.map((cat) => {
    const theme = getCategoryTheme(cat);
    const isActive = categoryFilter === cat;

    return (
      <button
        key={cat}
        onClick={() => handleCategoryFilter(cat)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
          transition-all duration-200
          ${
            isActive
              ? theme.color + " shadow-md"
              : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"
          }
        `}
      >
        {cat !== "전체보기" && theme.emoji} {cat}
      </button>
    );
  })}
</div>;
```

**카드에 카테고리 뱃지 추가**:

```tsx
<div className="p-6 h-full flex flex-col">
  {/* 카드 헤더 */}
  <div className="mb-4">
    {/* 🆕 카테고리 뱃지 */}
    {story.category && (
      <span
        className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full 
          text-xs font-medium mb-2
          ${getCategoryTheme(story.category).color}
        `}
      >
        {getCategoryTheme(story.category).emoji}
        {story.category}
      </span>
    )}

    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
      {story.title}
    </h3>
    <p className="text-sm text-gray-500 mt-1">{story.authorName}</p>
  </div>

  {/* 카드 본문 */}
  <p className="text-gray-600 text-sm line-clamp-4 flex-1">{story.content}</p>

  {/* 카드 푸터 */}
  <div className="mt-4 pt-4 border-t border-gray-100">
    <span className="text-xs text-gray-400">
      {new Date(story.createdAt).toLocaleDateString("ko-KR")}
    </span>
  </div>
</div>
```

---

## 🔧 7단계: API 함수 수정

### 파일: `lib/api.ts`

**Letter 인터페이스에 카테고리 필드 추가**:

```typescript
export interface Letter {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  ogPreviewMessage?: string;
  ogBgColor?: string;
  ogIllustration?: string;
  ogFontSize?: number;
  // 🆕 AI 분류 필드
  category?: string;
  aiMetadata?: {
    confidence: number;
    reason: string;
    tags: string[];
    classifiedAt: string;
    model: string;
  };
}
```

**createStory 함수 수정**:

```typescript
export async function createStory(
  data: {
    title: string;
    content: string;
    authorName: string;
    ogTitle?: string;
    ogPreviewText: string;
    category?: string; // 🆕 AI 분류 카테고리
    aiMetadata?: any; // 🆕 AI 메타데이터
  },
  token?: string
): Promise<{ data: { _id: string } }> {
  return apiRequest("/api/letters", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...data,
      type: "story",
    }),
  });
}
```

---

## ✅ 체크리스트

프론트엔드 구현 시 다음 사항을 확인하세요:

- [ ] `ai`, `@ai-sdk/google`, `zod` 패키지 설치
- [ ] `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY` 추가
- [ ] `app/api/ai/categorize/route.ts` 생성
- [ ] `lib/categoryTheme.ts` 생성
- [ ] `app/(afterLogin)/write/page.tsx` 수정 (AI 분류 호출)
- [ ] `lib/api.ts` 수정 (Letter 인터페이스, createStory 함수)
- [ ] `app/stories/page.tsx` 수정 (카테고리 필터, 뱃지)
- [ ] 로컬에서 테스트
- [ ] Vercel에 환경 변수 추가

---

## 🧪 테스트 방법

### 1. API Route 테스트

```bash
curl -X POST http://localhost:3000/api/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "엄마에게 보내는 편지",
    "content": "엄마, 항상 고마워요. 말로 표현하지 못했지만 엄마가 해주신 모든 것들이 제 삶의 힘이 되고 있어요."
  }'
```

**예상 응답**:

```json
{
  "success": true,
  "data": {
    "category": "가족",
    "confidence": 0.95,
    "reason": "부모님에 대한 감사와 사랑을 표현하는 내용",
    "tags": ["엄마", "감사", "사랑", "가족"]
  }
}
```

### 2. 사연 작성 테스트

1. `/write` 페이지 접속
2. "사연 (공개)" 선택
3. 제목과 내용 작성
4. "사연 제출하기" 클릭
5. "AI 분류 중..." 표시 확인
6. 카테고리 알림 확인

### 3. 사연 목록 테스트

1. `/stories` 페이지 접속
2. 카테고리 필터 버튼 확인
3. 각 카드에 카테고리 뱃지 표시 확인

---

## 🚀 Vercel 배포 시 주의사항

### 환경 변수 추가

Vercel Dashboard → Settings → Environment Variables:

```
Name: GOOGLE_GENERATIVE_AI_API_KEY
Value: your-api-key-here
Environment: Production, Preview, Development
```

### 재배포

환경 변수 추가 후 반드시 재배포:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 📚 참고 문서

- [Vercel AI SDK 공식 문서](https://sdk.vercel.ai/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Zod 스키마 문서](https://zod.dev/)

---

**구현 완료 후 백엔드 개발자에게 알려주세요!** 🎉
