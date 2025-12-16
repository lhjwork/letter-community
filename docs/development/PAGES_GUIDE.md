# 페이지 구조 가이드

## 📄 페이지 개요

Letter Community는 하나의 통합 작성 페이지에서 두 가지 타입의 편지 작성을 지원합니다:

1. **사연 쓰기** - 공개 사연 작성 (type: "story")
2. **편지 쓰기** - 친구에게 개인 편지 보내기 (type: "friend")

**통합 페이지**: `/write` - Select로 타입 전환

---

## 🎯 타입 비교

| 구분            | 사연 (story)       | 편지 (friend)      |
| --------------- | ------------------ | ------------------ |
| **타입**        | `type: "story"`    | `type: "friend"`   |
| **대상**        | 불특정 다수 (공개) | 특정인 (이메일)    |
| **에디터**      | Tiptap (공통)      | Tiptap (공통)      |
| **필수 입력**   | 제목, 내용, 작성자 | 이메일, 제목, 내용 |
| **전송 방식**   | 즉시 등록          | 이메일 발송        |
| **용도**        | 사연 공유, 이야기  | 개인 메시지        |
| **작성자 표시** | 입력한 작성자명    | 로그인 사용자명    |

---

## 📝 통합 작성 페이지 (`/write`)

### 경로

```
/write
```

### 특징

- **Select로 타입 전환** (사연/편지)
- **Tiptap 에디터** 사용 (볼드, 이탤릭, 리스트 등)
- **편지지 스타일** 디자인
- 타입에 따라 UI 동적 변경

### Select 옵션 (shadcn/ui)

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select
  value={letterType}
  onValueChange={(value) => setLetterType(value as LetterType)}
>
  <SelectTrigger className="w-full h-12 text-base">
    <SelectValue placeholder="편지 유형을 선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="story">사연 (공개)</SelectItem>
    <SelectItem value="friend">일반 편지 (개인)</SelectItem>
  </SelectContent>
</Select>;
```

---

## 📝 1. 사연 쓰기 (type: "story")

### 선택 방법

```
Select: "사연 (공개)"
```

### 특징

- **공개 사연** 형태
- 작성 후 즉시 등록
- 작성자명 직접 입력

### 입력 필드

```typescript
{
  title: string; // 제목
  content: string; // 본문 (HTML)
  authorName: string; // 작성자
}
```

### UI 구성

- 제목 입력
- Tiptap 에디터 (본문)
- 작성자 입력 (하단 우측)
- "사연 제출하기" 버튼

### API 요청

```typescript
POST /api/letters
{
  type: "story",
  title: "제목",
  content: "본문",
  authorName: "작성자",
  ogTitle: "제목",
  ogPreviewText: "본문 앞 60자..."
}
```

---

## ✉️ 2. 편지 쓰기 (type: "friend")

### 선택 방법

```
Select: "일반 편지 (개인)"
```

### 특징

- **개인 편지** 형태
- 받는 사람 이메일로 발송
- 로그인 사용자명 자동 표시

### 입력 필드

```typescript
{
  receiverEmail: string; // 받는 사람 이메일
  title: string; // 제목
  content: string; // 본문 (HTML)
}
```

### UI 구성

- 받는 사람 이메일 입력
- 제목 입력
- Tiptap 에디터 (본문)
- 작성자 자동 표시 (하단 우측)
- "편지 보내기" 버튼
- 안내 메시지 (이메일 발송 안내)

### API 요청

```typescript
POST /api/letters
{
  type: "friend",
  receiverEmail: "friend@example.com",
  title: "제목",
  content: "본문",
  ogTitle: "제목",
  ogPreviewText: "본문 앞 60자..."
}
```

---

## 🔄 데이터 흐름

### 사연 쓰기 플로우

```
1. 사용자가 /write 접속
2. Select에서 "사연 (공개)" 선택
3. 제목, 본문, 작성자 입력
4. "사연 제출하기" 버튼 클릭
5. createStory() API 호출
6. type: "story"로 저장
7. /letter/:id 페이지로 이동
```

### 편지 쓰기 플로우

```
1. 사용자가 /write 접속
2. Select에서 "일반 편지 (개인)" 선택
3. 이메일, 제목, 본문 입력
4. "편지 보내기" 버튼 클릭
5. sendLetterToFriend() API 호출
6. type: "friend"로 저장
7. 받는 사람 이메일로 링크 발송
8. /letter/:id 페이지로 이동
```

---

## 🎨 UI 동적 변경

### 타입에 따른 UI 변화

#### 페이지 타이틀

```tsx
{
  letterType === "story" ? "당신의 사연을 들려주세요" : "친구에게 편지 쓰기";
}
```

#### 받는 사람 필드

```tsx
{
  letterType === "friend" && (
    <input type="email" placeholder="friend@example.com" />
  );
}
```

#### 작성자 표시

```tsx
{
  letterType === "story" ? (
    <input placeholder="작성자" />
  ) : (
    <span>From. {session?.user?.name || "익명"}</span>
  );
}
```

#### 제출 버튼

```tsx
<button>{letterType === "story" ? "사연 제출하기" : "편지 보내기"}</button>
```

#### 안내 메시지

```tsx
{
  letterType === "friend" && (
    <div>💡 편지를 보내면 받는 사람의 이메일로 링크가 전송됩니다.</div>
  );
}
```

---

## 📊 백엔드 데이터 모델

### Letter 스키마

```typescript
interface Letter {
  _id: ObjectId;
  type: "story" | "friend"; // 타입 구분

  // 사연 (story)
  authorName?: string; // 작성자 (사연만)

  // 편지 (friend)
  senderUserId?: ObjectId; // 보낸 사람 (편지만)
  receiverEmail?: string; // 받는 사람 (편지만)

  // 공통
  title: string;
  content: string;
  ogTitle?: string;
  ogPreviewText: string;
  status: string;
  physicalRequested: boolean;
  createdAt: Date;
}
```

---

## 🔧 API 함수

### lib/api.ts

#### 사연 등록

```typescript
export async function createStory(
  data: {
    title: string;
    content: string;
    authorName: string;
    ogTitle?: string;
    ogPreviewText: string;
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

#### 편지 보내기

```typescript
export async function sendLetterToFriend(
  data: {
    receiverEmail: string;
    title: string;
    content: string;
    ogTitle?: string;
    ogPreviewText: string;
  },
  token?: string
): Promise<{ data: { _id: string } }> {
  return apiRequest("/api/letters", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...data,
      type: "friend",
    }),
  });
}
```

---

## 🚀 사용 예시

### 컴포넌트 구조

```tsx
export default function WritePage() {
  const [letterType, setLetterType] = useState<"story" | "friend">("story");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const editor = useLetterEditor({
    content,
    onChange: setContent,
    placeholder: letterType === "story"
      ? "여기에 당신의 이야기를 작성해주세요..."
      : "여기에 당신의 마음을 담아주세요...",
  });

  const handleSubmit = async () => {
    // 유효성 검사
    // ...

    if (letterType === "story") {
      const result = await createStory({ ... }, token);
    } else {
      const result = await sendLetterToFriend({ ... }, token);
    }
  };

  return (
    <div>
      {/* Select로 타입 선택 (shadcn/ui) */}
      <Select
        value={letterType}
        onValueChange={(value) => setLetterType(value as LetterType)}
      >
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue placeholder="편지 유형을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="story">사연 (공개)</SelectItem>
          <SelectItem value="friend">일반 편지 (개인)</SelectItem>
        </SelectContent>
      </Select>

      {/* 타입에 따라 UI 동적 변경 */}
      {letterType === "friend" && (
        <input type="email" value={receiverEmail} />
      )}

      {/* Tiptap 에디터 (공통) */}
      <EditorContent editor={editor} />

      {/* 작성자 표시 */}
      {letterType === "story" ? (
        <input value={author} />
      ) : (
        <span>From. {session?.user?.name}</span>
      )}
    </div>
  );
}
```

---

## 🎯 라우팅

### 메인 페이지에서 이동

```tsx
// app/(beforeLogin)/page.tsx
<Link href="/write">사연/편지 쓰러 가기</Link>
```

### 작성 완료 후 이동

```tsx
// 작성 완료 후 상세 페이지로 이동
router.push(`/letter/${letterId}`);
```

---

## ✅ 체크리스트

### 통합 페이지 구현 체크리스트

- [x] `/write` 경로 접근 가능
- [x] shadcn/ui Select로 타입 전환 가능
- [x] Tiptap 에디터 정상 작동
- [x] 타입에 따라 UI 동적 변경
- [x] 사연: 제목, 본문, 작성자 입력
- [x] 편지: 이메일, 제목, 본문 입력
- [x] 이메일 형식 검증
- [x] 타입별 API 호출
- [x] 작성 후 상세 페이지로 이동
- [x] shadcn/ui Select 컴포넌트 통합 완료

---

## 🐛 문제 해결

### Select가 작동하지 않는 경우

1. `letterType` state 확인
2. `onChange` 핸들러 확인
3. `value` 속성 확인

### UI가 변경되지 않는 경우

1. 조건부 렌더링 확인
2. `letterType` 값 확인
3. React 리렌더링 확인

### API 호출이 실패하는 경우

1. `type` 필드 포함 확인
2. 필수 필드 확인
3. 백엔드 API 엔드포인트 확인

---

## 📚 관련 문서

- [MVP 구현 가이드](MVP_IMPLEMENTATION.md)
- [OG 이미지 가이드](OG_IMAGE_GUIDE.md)
- [API 문서](../../README.md)

---

**마지막 업데이트:** 2024년 12월 17일

## 🎨 UI 컴포넌트

### shadcn/ui Select 사용

통합 작성 페이지는 shadcn/ui의 Select 컴포넌트를 사용하여 더 나은 사용자 경험을 제공합니다:

- 접근성 향상 (Radix UI 기반)
- 일관된 디자인 시스템
- 키보드 네비게이션 지원
- 모바일 친화적 UI
