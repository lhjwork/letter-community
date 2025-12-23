# 🎨 프론트엔드 HTML 콘텐츠 전송 개선 프롬프트

## 📋 문제 상황

현재 Tiptap 에디터로 작성된 HTML 형식의 편지 내용이 백엔드로 전송될 때 `plainContent`(HTML 태그 제거된 텍스트)로만 전송되어 서식이 손실되고 있습니다.

**현재 문제점:**

- 굵은 글씨, 기울임, 색상 등 서식이 백엔드에 저장되지 않음
- 줄바꿈이 제대로 전달되지 않음
- 편지 상세 화면에서 일반 텍스트로만 표시됨

## 🎯 해결 목표

- Tiptap 에디터의 HTML 형식을 그대로 백엔드로 전송
- 편지 상세 화면에서 작성 시와 동일한 서식 표시
- 기존 일반 텍스트 편지와의 호환성 유지

---

## 🛠 프론트엔드 수정 사항

### 1. 편지 작성 페이지 수정

#### `app/(afterLogin)/write/page.tsx` 수정

```typescript
// 현재 문제가 되는 부분
const handleSubmit = async () => {
  // HTML 태그 제거하여 순수 텍스트만 추출 ❌
  const plainContent = content.replace(/<[^>]*>/g, "").trim();

  if (letterType === "story") {
    result = await createStory(
      {
        title: title.trim(),
        content: plainContent, // ❌ HTML 서식 손실
        // ...
      },
      token
    );
  } else {
    result = await createLetter(
      {
        title: title.trim(),
        content: plainContent, // ❌ HTML 서식 손실
        // ...
      },
      token
    );
  }
};
```

#### 수정된 코드

```typescript
const handleSubmit = async () => {
  // 내용 유효성 검사
  if (!content.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  // HTML 형식 그대로 사용 ✅
  const htmlContent = content.trim();

  // 미리보기용 일반 텍스트 (OG 이미지, 검색용)
  const plainContent = content.replace(/<[^>]*>/g, "").trim();

  // 타입별 유효성 검사
  if (letterType === "story") {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!author.trim()) {
      alert("작성자를 입력해주세요.");
      return;
    }
  } else {
    if (!title.trim()) {
      const shouldGenerate = confirm("제목이 없습니다. AI로 제목을 생성하시겠습니까?");
      if (shouldGenerate) {
        await generateAITitle();
        return;
      } else {
        alert("제목을 입력하거나 AI 제목 생성을 사용해주세요.");
        return;
      }
    }
  }

  setIsSubmitting(true);

  try {
    const token = session?.backendToken;
    let result;

    if (letterType === "story") {
      // 사연 등록 - AI 분류는 일반 텍스트로
      const classificationResult = classifyCategory(title.trim(), plainContent);
      const aiCategory = classificationResult.category;
      const aiMetadata = {
        confidence: classificationResult.confidence,
        reason: classificationResult.reason,
        tags: classificationResult.tags,
        classifiedAt: new Date().toISOString(),
        model: "keyword-based-frontend",
      };

      const ogPreviewText = plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

      result = await createStory(
        {
          title: title.trim(),
          content: htmlContent, // ✅ HTML 형식으로 전송
          authorName: author.trim(),
          ogTitle: title.trim(),
          ogPreviewText,
          category: aiCategory,
          aiMetadata,
        },
        token
      );

      alert(`사연이 "${aiCategory}" 카테고리로 등록되었습니다! 💌`);

      if (result?.data?._id) {
        router.push(`/letter/${result.data._id}`);
      } else {
        router.push("/");
      }
    } else {
      // 일반 편지 - URL 공유
      const ogPreviewText = plainContent.slice(0, 60) + (plainContent.length > 60 ? "..." : "");

      result = await createLetter(
        {
          title: title.trim(),
          content: htmlContent, // ✅ HTML 형식으로 전송
          type: "friend",
          ogTitle: title.trim(),
          ogPreviewText,
        },
        token
      );

      setShareData({
        url: result.data.url,
        title: result.data.title,
      });
      setShowShareModal(true);
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert(error instanceof Error ? error.message : "등록에 실패했습니다. 다시 시도해주세요.");
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. AI 제목 생성 함수 수정

#### 현재 문제

```typescript
const generateAITitle = async () => {
  if (letterType === "friend" && content) {
    const plainContent = content.replace(/<[^>]*>/g, "").trim(); // ❌ HTML 제거

    if (canGenerateTitle(plainContent)) {
      const generatedTitle = await generateTitle(plainContent); // ❌ 서식 없는 텍스트로 제목 생성
      // ...
    }
  }
};
```

#### 수정된 코드

```typescript
const generateAITitle = async () => {
  if (letterType === "friend" && content) {
    // AI 제목 생성은 일반 텍스트로 (AI가 HTML을 이해하지 못할 수 있음)
    const plainContent = content.replace(/<[^>]*>/g, "").trim();

    if (canGenerateTitle(plainContent)) {
      setIsGeneratingTitle(true);
      try {
        const generatedTitle = await generateTitle(plainContent);
        setAiGeneratedTitle(generatedTitle);
        setTitle(generatedTitle);
      } catch (error) {
        console.error("제목 생성 실패:", error);
        alert("제목 생성에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsGeneratingTitle(false);
      }
    } else {
      alert("제목을 생성하기 위해서는 더 많은 내용을 작성해주세요.");
    }
  }
};
```

### 3. API 함수 타입 정의 수정

#### `lib/api.ts` 타입 업데이트

```typescript
// 사연 생성 인터페이스
interface CreateStoryData {
  title: string;
  content: string; // HTML 형식 콘텐츠
  authorName: string;
  ogTitle: string;
  ogPreviewText: string;
  category: string;
  aiMetadata: {
    confidence: number;
    reason: string;
    tags: string[];
    classifiedAt: string;
    model: string;
  };
}

// 편지 생성 인터페이스
interface CreateLetterData {
  title: string;
  content: string; // HTML 형식 콘텐츠
  type: "friend";
  ogTitle: string;
  ogPreviewText: string;
}

// API 함수들은 그대로 유지 (백엔드에서 HTML 처리)
export async function createStory(data: CreateStoryData, token?: string) {
  return apiRequest("/api/letters", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function createLetter(data: CreateLetterData, token?: string) {
  return apiRequest("/api/letters/create", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}
```

### 4. 편지 상세 화면 개선

#### `app/letter/[letterId]/LetterDetailClient.tsx` 확인

```typescript
// 이미 dangerouslySetInnerHTML로 HTML 렌더링 중 ✅
<div
  className="letter-content text-gray-800"
  style={{
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: "16px",
    lineHeight: "28px",
  }}
  dangerouslySetInnerHTML={{ __html: letter.content }} // ✅ HTML 형식 렌더링
/>
```

### 5. 에디터 설정 확인

#### `components/editor/useLetterEditor.ts` 확인

```typescript
// Tiptap 에디터가 HTML을 올바르게 생성하는지 확인
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Image,
    Placeholder.configure({
      placeholder: options.placeholder,
    }),
  ],
  content: options.content,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML(); // ✅ HTML 형식으로 가져오기
    options.onChange(html);
  },
});
```

### 6. 디버깅 및 검증 코드 추가

#### 개발 환경에서 콘텐츠 확인

```typescript
const handleSubmit = async () => {
  // 개발 환경에서 콘텐츠 형식 확인
  if (process.env.NODE_ENV === "development") {
    console.log("=== 편지 콘텐츠 디버깅 ===");
    console.log("HTML 콘텐츠:", content);
    console.log("일반 텍스트:", content.replace(/<[^>]*>/g, "").trim());
    console.log("콘텐츠 길이:", content.length);
    console.log("HTML 태그 포함 여부:", /<[^>]*>/g.test(content));
  }

  // 실제 전송 로직...
};
```

---

## 🧪 테스트 시나리오

### 1. 서식 포함 편지 작성 테스트

```typescript
// 테스트할 콘텐츠 예시
const testContent = `
<p>안녕하세요!</p>
<p><strong>굵은 글씨</strong>와 <em>기울임</em>이 있는 편지입니다.</p>
<p><span style="color: red;">빨간색 텍스트</span>도 있어요.</p>
<ul>
  <li>목록 항목 1</li>
  <li>목록 항목 2</li>
</ul>
<p>줄바꿈도<br>제대로<br>표시되나요?</p>
`;
```

### 2. 백엔드 전송 데이터 확인

```typescript
// 네트워크 탭에서 확인할 전송 데이터
{
  "title": "테스트 편지",
  "content": "<p>안녕하세요!</p><p><strong>굵은 글씨</strong>입니다.</p>", // ✅ HTML 형식
  "type": "friend",
  "ogTitle": "테스트 편지",
  "ogPreviewText": "안녕하세요! 굵은 글씨입니다."
}
```

### 3. 편지 상세 화면 렌더링 확인

- 작성 시와 동일한 서식이 표시되는지 확인
- 줄바꿈, 굵은 글씨, 기울임, 색상 등이 올바르게 렌더링되는지 확인

---

## 🔧 추가 개선사항

### 1. 콘텐츠 유효성 검사 강화

```typescript
const validateContent = (content: string): boolean => {
  // HTML 콘텐츠 기본 검증
  if (!content || content.trim().length === 0) {
    return false;
  }

  // 일반 텍스트 추출하여 최소 길이 확인
  const plainText = content.replace(/<[^>]*>/g, "").trim();
  return plainText.length >= 10; // 최소 10자
};
```

### 2. 에러 처리 개선

```typescript
const handleSubmit = async () => {
  try {
    // 콘텐츠 유효성 검사
    if (!validateContent(content)) {
      alert("편지 내용을 10자 이상 작성해주세요.");
      return;
    }

    // 전송 로직...
  } catch (error) {
    console.error("편지 전송 실패:", error);

    // 상세한 에러 메시지 제공
    if (error instanceof Error) {
      if (error.message.includes("content")) {
        alert("편지 내용에 문제가 있습니다. 다시 확인해주세요.");
      } else {
        alert(error.message);
      }
    } else {
      alert("편지 전송에 실패했습니다. 다시 시도해주세요.");
    }
  }
};
```

### 3. 로딩 상태 개선

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

// 제출 버튼에 로딩 상태 표시
<button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <div className="flex items-center gap-2">
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
      {letterType === "story" ? "사연 등록 중..." : "편지 생성 중..."}
    </div>
  ) : letterType === "story" ? (
    "사연 제출하기"
  ) : (
    "편지 만들기"
  )}
</button>;
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] `handleSubmit` 함수에서 HTML 콘텐츠 전송으로 수정
- [ ] AI 제목 생성 함수 유지 (일반 텍스트 사용)
- [ ] API 타입 정의 업데이트
- [ ] 콘텐츠 유효성 검사 함수 추가
- [ ] 에러 처리 개선
- [ ] 로딩 상태 UI 개선
- [ ] 디버깅 코드 추가 (개발 환경)

### 테스트 완료 체크

- [ ] 굵은 글씨, 기울임 서식 전송 테스트
- [ ] 색상, 하이라이트 서식 전송 테스트
- [ ] 줄바꿈 전송 테스트
- [ ] 목록(ul, ol) 전송 테스트
- [ ] 편지 상세 화면에서 서식 표시 확인
- [ ] AI 제목 생성 정상 동작 확인
- [ ] 기존 일반 텍스트 편지 호환성 확인

---

## 🔗 관련 파일

- `app/(afterLogin)/write/page.tsx` - 편지 작성 페이지
- `lib/api.ts` - API 함수들
- `app/letter/[letterId]/LetterDetailClient.tsx` - 편지 상세 화면
- `components/editor/useLetterEditor.ts` - Tiptap 에디터 설정

---

## 🔗 관련 문서

- [백엔드 HTML 콘텐츠 지원 개선 프롬프트](../backend/BACKEND_HTML_CONTENT_SUPPORT_PROMPT.md)
- [편지 서식 지원 구현 가이드](../../guides/LETTER_FORMATTING_IMPLEMENTATION_GUIDE.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 2-3시간  
**의존성**: 백엔드 HTML 콘텐츠 지원 구현 필요
