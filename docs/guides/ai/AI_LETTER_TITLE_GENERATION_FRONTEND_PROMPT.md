# 🎨 프론트엔드 AI 프롬프트 - 편지 제목 자동 생성 (URL 공유 방식)

## 📋 요구사항

Next.js 프로젝트에 **Vercel AI SDK + Google Gemini**를 사용하여 일반 편지의 제목을 자동 생성하고, **URL 공유 방식**으로 편지를 전달하는 기능을 구현해주세요.

---

## 🎯 구현할 기능

### 1. 일반 편지 작성 개선

- **받는 사람 이메일 입력 제거** (URL 공유 방식으로 변경)
- **제목 입력 필드 제거** (AI가 자동 생성)
- **내용만 작성**하면 AI가 제목을 자동으로 생성

### 2. AI 제목 생성 + URL 공유 로직

- 사용자가 편지 내용을 작성 완료 후 "편지 만들기" 버튼 클릭
- **편지 내용을 기반으로 AI가 적절한 제목 생성**
- 생성된 제목과 함께 백엔드로 전송하여 편지 생성
- **편지 URL을 생성하여 사용자에게 제공** (공유용)

---

## 🛠 기술 스택

- **AI SDK**: Vercel AI SDK
- **AI 모델**: Google Gemini
- **프레임워크**: Next.js 14 (App Router)
- **상태 관리**: React useState
- **에디터**: Tiptap

---

## 📁 수정할 파일

### 1. `app/(afterLogin)/write/page.tsx`

- 일반 편지 타입에서 받는 사람 이메일 입력 필드 제거
- 제목 입력 필드 제거 (사연은 유지)
- AI 제목 생성 로직 추가

### 2. `lib/ai-title-generator.ts` (새로 생성)

- Vercel AI SDK를 사용한 제목 생성 함수
- Google Gemini 연동

### 3. `app/api/ai/generate-title/route.ts` (새로 생성)

- 제목 생성 API 엔드포인트

---

## 🎨 UI/UX 개선사항

### 편지 작성 화면 변경

**기존 (일반 편지):**

```
받는 사람 이메일: [입력 필드]
제목: [입력 필드]
내용: [에디터]
```

**개선 후 (일반 편지):**

```
내용: [에디터]
💡 AI가 내용을 바탕으로 제목을 자동 생성합니다
📋 편지 완성 후 공유 가능한 URL을 제공합니다
```

**사연은 기존 유지:**

```
제목: [입력 필드]
내용: [에디터]
작성자: [입력 필드]
```

---

## 🔧 구현 세부사항

### 1. AI 제목 생성 프롬프트

```typescript
const TITLE_GENERATION_PROMPT = `
편지 내용을 분석하여 적절한 제목을 생성해주세요.

규칙:
1. 제목은 10-20자 이내로 작성
2. 편지의 핵심 감정이나 메시지를 담아야 함
3. 따뜻하고 친근한 톤으로 작성
4. 특수문자나 이모지 사용 금지
5. 한국어로 작성

편지 내용:
{content}

제목만 반환해주세요.
`;
```

### 2. 제목 생성 API

```typescript
// app/api/ai/generate-title/route.ts
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  const { content } = await request.json();

  const result = await generateObject({
    model: google("gemini-1.5-flash"),
    prompt: `편지 내용을 분석하여 적절한 제목을 생성해주세요...`,
    schema: z.object({
      title: z.string().describe("생성된 편지 제목"),
    }),
  });

  return Response.json({ title: result.object.title });
}
```

### 3. 프론트엔드 통합

```typescript
// 제목 생성 함수
const generateTitle = async (content: string): Promise<string> => {
  const response = await fetch("/api/ai/generate-title", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const { title } = await response.json();
  return title;
};

// 편지 제출 로직
const handleSubmit = async () => {
  if (letterType === "friend") {
    // AI로 제목 생성
    const generatedTitle = await generateTitle(content);

    // 백엔드로 전송하여 편지 생성
    const result = await createLetter(
      {
        title: generatedTitle,
        content: plainContent,
        type: "friend",
      },
      token
    );

    // 편지 URL 생성 및 공유 모달 표시
    const letterUrl = `${window.location.origin}/letter/${result.data._id}`;
    showShareModal(letterUrl, generatedTitle);
  }
};
```

---

## 🎯 사용자 플로우

### 일반 편지 작성 플로우

1. **편지 유형 선택**: "일반 편지 (개인)" 선택
2. **내용 작성**: Tiptap 에디터에서 편지 내용 작성
3. **편지 만들기 클릭**:
   - AI가 내용을 분석하여 제목 자동 생성
   - 백엔드에서 편지 생성 및 고유 ID 발급
   - 편지 URL 생성: `https://letter-community.com/letter/{id}`
4. **URL 공유**:
   - 생성된 URL을 복사하여 원하는 사람에게 공유
   - 카카오톡, 메신저, SNS 등으로 자유롭게 전달
   - OG 이미지로 미리보기 제공

### 사연 작성 플로우 (기존 유지)

1. **편지 유형 선택**: "사연 (공개)" 선택
2. **제목 입력**: 사용자가 직접 입력
3. **내용 작성**: Tiptap 에디터에서 사연 내용 작성
4. **작성자 입력**: 작성자명 입력
5. **사연 제출**: AI 카테고리 분류 후 등록

---

## 🔒 환경 변수 설정

```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

---

## 🧪 테스트 시나리오

### 1. 제목 생성 테스트

**입력 내용:**

```
안녕하세요! 오랜만에 연락드려요.
요즘 어떻게 지내시나요? 저는 새로운 직장에서
열심히 일하고 있어요. 언제 시간 되실 때
만나서 이야기 나누면 좋겠어요.
```

**예상 제목:**

- "오랜만에 안부 인사드려요"
- "근황 전하며 만남을 기대하며"
- "새 직장 소식과 함께"

### 2. 다양한 감정의 편지 테스트

**감사 편지:**

```
정말 고마워요. 힘들 때 옆에서
도와주셔서 감사합니다...
```

→ "진심 어린 감사 인사"

**축하 편지:**

```
승진 소식 들었어요! 정말 축하해요...
```

→ "승진을 축하하며"

---

## 📱 반응형 디자인

- **모바일**: 편지지 레이아웃 최적화
- **태블릿**: 에디터 툴바 적절한 크기 조정
- **데스크톱**: 기존 레이아웃 유지

---

## 🚀 성능 최적화

1. **제목 생성 캐싱**: 동일한 내용에 대해 중복 요청 방지
2. **로딩 상태**: 제목 생성 중 로딩 인디케이터 표시
3. **에러 처리**: AI 생성 실패 시 기본 제목 사용

---

## 🎨 UI 컴포넌트

### 로딩 상태 표시

```typescript
{
  isGeneratingTitle && (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
      AI가 제목을 생성하고 있습니다...
    </div>
  );
}
```

### 안내 메시지

```typescript
{
  letterType === "friend" && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-blue-700">
        <span>🤖</span>
        <span className="font-medium">AI 제목 자동 생성 + URL 공유</span>
      </div>
      <p className="text-sm text-blue-600 mt-1">편지 내용을 바탕으로 제목을 자동 생성하고, 공유 가능한 링크를 만들어드립니다</p>
    </div>
  );
}
```

### URL 공유 모달 컴포넌트

```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterUrl: string;
  letterTitle: string;
}

function ShareModal({ isOpen, onClose, letterUrl, letterTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(letterUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">편지가 완성되었습니다! 💌</h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">제목</p>
          <p className="font-medium">{letterTitle}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-600 mb-2">공유 링크</p>
          <p className="text-sm font-mono break-all">{letterUrl}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90">
            {copied ? "복사됨! ✓" : "링크 복사"}
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            닫기
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">이 링크를 원하는 사람에게 공유하세요</p>
      </div>
    </div>
  );
}
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] `lib/ai-title-generator.ts` 생성
- [ ] `app/api/ai/generate-title/route.ts` 생성
- [ ] `components/ShareModal.tsx` 생성
- [ ] `app/(afterLogin)/write/page.tsx` 수정
  - [ ] 일반 편지에서 이메일 입력 필드 제거
  - [ ] 일반 편지에서 제목 입력 필드 제거
  - [ ] AI 제목 생성 로직 추가
  - [ ] URL 공유 모달 통합
- [ ] `lib/api.ts`에 `createLetter` 함수 추가
- [ ] 환경 변수 설정
- [ ] 로딩 상태 UI 추가
- [ ] 에러 처리 로직 추가
- [ ] 테스트 시나리오 검증

### 테스트 완료 체크

- [ ] 다양한 내용의 편지로 제목 생성 테스트
- [ ] 사연 작성 기능 정상 동작 확인
- [ ] 반응형 디자인 확인
- [ ] 에러 상황 처리 확인

---

## 🔗 관련 문서

- [백엔드 편지 제목 생성 프롬프트](../development/backend/BACKEND_LETTER_TITLE_GENERATION_PROMPT.md)
- [AI 자동 분류 구현 가이드](AI_CATEGORY_IMPLEMENTATION_GUIDE.md)
- [Vercel AI SDK 문서](https://sdk.vercel.ai/docs)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 4-6시간  
**의존성**: Google Gemini API 키 필요
